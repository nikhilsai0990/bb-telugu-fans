import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { DatabaseService, Poll, PollOption, Vote } from "../database/database.service";
import { RedisRateLimiterService } from "../redis/redis-rate-limiter.service";
import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";

export function isVotingScheduleOpen(
  poll?: { startsAt?: Date | string; endsAt?: Date | string; status?: string } | null,
  now: Date = new Date()
): boolean {
  if (process.env.FORCE_VOTING_OPEN === "true") return true;
  if (process.env.FORCE_VOTING_CLOSED === "true") return false;

  // Poll-level configurable schedule window
  if (poll) {
    if (poll.status === "CLOSED" || poll.status === "ARCHIVED" || poll.status === "DRAFT") {
      return false;
    }

    if (poll.startsAt && poll.endsAt) {
      const start = new Date(poll.startsAt).getTime();
      const end = new Date(poll.endsAt).getTime();
      const current = now.getTime();

      // Prior to scheduled start
      if (current < start) {
        return false;
      }
      // Past scheduled end -> automatically closes
      if (current > end) {
        return false;
      }
      return true;
    }

    // If poll.status is ACTIVE and no specific dates are set, it's open unless explicitly forced
    if (poll.status === "ACTIVE") {
      return true;
    }
  }

  // Fallback default IST schedule (Monday 00:00:00 to Friday 23:59:59 IST)
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
    });
    const parts = formatter.formatToParts(now);
    const weekday = parts.find((p) => p.type === "weekday")?.value;
    if (weekday === "Sat" || weekday === "Sun") {
      return false;
    }
    return true;
  } catch (e) {
    const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utcTime + 3600000 * 5.5);
    const day = istTime.getDay(); // 0 is Sun, 6 is Sat
    return day >= 1 && day <= 5;
  }
}

@Injectable()
export class PollsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly rateLimiter: RedisRateLimiterService,
  ) {}

  public getAllPolls(statusFilter?: string) {
    const list: Poll[] = [];
    for (const poll of this.db.polls.values()) {
      // Dynamic schedule sync for Season 10 polls
      const isScheduleOpen = isVotingScheduleOpen(poll);
      const effectiveStatus = !isScheduleOpen ? "CLOSED" : poll.status;

      if (!statusFilter || effectiveStatus.toLowerCase() === statusFilter.toLowerCase()) {
        const options = Array.from(this.db.pollOptions.values()).filter((opt) => opt.pollId === poll.id);
        list.push({
          ...poll,
          status: effectiveStatus,
          options: options.map((opt) => ({
            ...opt,
            votesCount: opt.votesCount || 0,
            percentage: poll.totalVotes > 0 ? parseFloat(((opt.votesCount / poll.totalVotes) * 100).toFixed(1)) : 0,
          })),
        });
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public getPollById(id: string) {
    let poll = this.db.polls.get(id);
    if (!poll && (id === "poll-captain-week-02" || id === "poll-elimination-week-02")) {
      poll = this.db.polls.get("poll-elimination-week-02") || this.db.polls.get("poll-captain-week-02");
    }
    if (!poll) {
      throw new NotFoundException("Poll not found");
    }
    const isScheduleOpen = isVotingScheduleOpen(poll);
    const effectiveStatus = !isScheduleOpen ? "CLOSED" : poll.status;

    const options = Array.from(this.db.pollOptions.values()).filter((opt) => opt.pollId === poll.id);
    return {
      ...poll,
      status: effectiveStatus,
      options: options.map((opt) => ({
        ...opt,
        votesCount: opt.votesCount || 0,
        percentage: poll.totalVotes > 0 ? parseFloat(((opt.votesCount / poll.totalVotes) * 100).toFixed(1)) : 0,
      })),
    };
  }

  public resetPoll(pollId: string) {
    this.db.resetPollVotes(pollId);
    return {
      success: true,
      message: "Poll votes have been reset to 0.",
      poll: this.getPollById(pollId),
    };
  }

  public async castVote(params: {
    pollId: string;
    optionId: string;
    userId?: string;
    voterToken?: string;
    clientIp: string;
  }) {
    let { pollId, optionId, userId, voterToken, clientIp } = params;

    // 1. Authenticate user identity (Part 9: Anonymous voting is NOT allowed)
    if (!userId) {
      throw new UnauthorizedException("Authentication required to vote. Please sign in or sign up.");
    }

    // 2. Validate Poll Existence (with fallback alias support)
    let poll = this.db.polls.get(pollId);
    if (!poll && (pollId === "poll-captain-week-02" || pollId === "poll-elimination-week-02")) {
      poll = this.db.polls.get("poll-elimination-week-02") || this.db.polls.get("poll-captain-week-02");
      if (poll) pollId = poll.id;
    }
    if (!poll) {
      throw new NotFoundException("Poll does not exist");
    }

    // 3. Validate Poll Lifecycle & Schedule (Section 4: Reject votes outside schedule)
    const isScheduleOpen = isVotingScheduleOpen(poll);
    if (poll.status === "CLOSED" || !isScheduleOpen || poll.status !== "ACTIVE") {
      throw new BadRequestException("Voting is currently closed.");
    }

    // 4. Validate Option Belongs to this Poll
    const option = this.db.pollOptions.get(optionId);
    if (!option || (option.pollId !== pollId && option.pollId !== poll.id)) {
      throw new BadRequestException("Selected option does not belong to this poll");
    }

    // 5. Validate Contestant is eligible for this poll (Section 1 & 11)
    if (option.contestantId) {
      const contestant = this.db.contestants.get(option.contestantId);
      if (!contestant || contestant.status === "ELIMINATED" || contestant.isEliminated || !contestant.isActive) {
        throw new BadRequestException("Voting is not permitted for eliminated contestants.");
      }

      // Excluded from Week 2 Elimination Poll: Aman, Jabardasth Naresh, Temper Vamsi, Charan, Chaitra Rai
      const isWeek2ElimPoll =
        poll.id === "poll-elimination-week-02" ||
        poll.id === "poll-captain-week-02" ||
        poll.category === "Elimination" ||
        poll.title.toUpperCase().includes("ELIMINATED");

      if (isWeek2ElimPoll) {
        const INELIGIBLE_CONTESTANT_IDS = ["c-12", "c-03", "c-07", "c-10", "c-13"];
        const INELIGIBLE_CONTESTANT_NAMES = ["aman", "jabardasth naresh", "temper vamsi", "charan", "chaitra rai"];

        if (
          INELIGIBLE_CONTESTANT_IDS.includes(option.contestantId) ||
          INELIGIBLE_CONTESTANT_NAMES.includes(contestant.name.toLowerCase())
        ) {
          throw new BadRequestException(`Contestant ${contestant.name} is not eligible for this elimination poll.`);
        }
      }
    }

    // 6. IP Anti-Abuse Network Rate Limit via Redis (Part 13 & 14)
    const ipHash = this.rateLimiter.hashIp(clientIp);
    await this.rateLimiter.checkRateLimit(ipHash);

    // 7. Pre-check for duplicate vote by userId in database (1 vote per user per day/poll)
    const todayStr = new Date().toISOString().slice(0, 10);
    for (const v of this.db.votes.values()) {
      if (v.pollId === pollId) {
        const voteDay = v.createdAt.toISOString().slice(0, 10);
        if (voteDay === todayStr && v.userId === userId) {
          throw new ConflictException({
            statusCode: HttpStatus.CONFLICT,
            error: "ALREADY_VOTED",
            message: "You have already cast your vote today. Only 1 vote per user per day is allowed.",
          });
        }
      }
    }

    // 7. Atomic Database Transaction with Race Condition Protection (Sections 22, 23, TC-VOTE-010, TC-VOTE-011, TC-VOTE-012)
    try {
      await this.db.executeTransaction(async (tx) => {
        // Insert vote record (DB will throw error if duplicate key)
        tx.insertVote({
          pollId,
          optionId,
          userId,
          voterTokenHash: voterToken ? this.rateLimiter.hashIp(voterToken) : undefined,
          ipHash,
        });

        // Increment poll total and option count atomically
        tx.incrementPollVotes(pollId, optionId);
      });

      // Increment IP counter in Redis only upon successful DB transaction
      await this.rateLimiter.incrementVoteCount(ipHash);
    } catch (err: any) {
      if (err.code === "23505" || err.message?.includes("Unique constraint violation")) {
        throw new ConflictException({
          statusCode: HttpStatus.CONFLICT,
          error: "ALREADY_VOTED",
          message: "You have already cast your vote today (duplicate detected).",
        });
      }
      throw err;
    }

    // 8. Return updated aggregate results from backend (Section 11, 22)
    const updatedOptions = Array.from(this.db.pollOptions.values()).filter((opt) => opt.pollId === pollId);
    const totalVotes = poll.totalVotes;

    let contestantName: string | undefined;
    if (option.contestantId) {
      const contestant = this.db.contestants.get(option.contestantId);
      if (contestant) contestantName = contestant.name;
    }
    if (!contestantName) {
      contestantName = option.text
        .replace(/Save\s*/i, "")
        .replace(/Vote\s*/i, "")
        .replace(/\s*for Captain/i, "")
        .replace(/\s*\([^)]*\)/i, "")
        .trim();
    }

    return {
      success: true,
      message: "Your vote has been securely recorded!",
      pollId,
      totalVotes,
      optionId,
      contestantName,
      options: updatedOptions.map((opt) => ({
        id: opt.id,
        text: opt.text,
        contestantId: opt.contestantId,
        votesCount: opt.votesCount,
        percentage: totalVotes > 0 ? parseFloat(((opt.votesCount / totalVotes) * 100).toFixed(1)) : 0,
      })),
    };
  }

  public getVoterStatus(params: {
    pollId: string;
    userId?: string;
  }) {
    let { pollId, userId } = params;
    if (!userId) {
      return { hasVoted: false };
    }

    if (!this.db.polls.has(pollId) && (pollId === "poll-captain-week-02" || pollId === "poll-elimination-week-02")) {
      const alt = this.db.polls.get("poll-elimination-week-02") || this.db.polls.get("poll-captain-week-02");
      if (alt) pollId = alt.id;
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    for (const v of this.db.votes.values()) {
      if ((v.pollId === pollId || (pollId === "poll-elimination-week-02" && v.pollId === "poll-captain-week-02")) && v.userId === userId) {
        const voteDay = v.createdAt.toISOString().slice(0, 10);
        if (voteDay === todayStr) {
          const option = this.db.pollOptions.get(v.optionId);
          let contestantName: string | undefined;
          if (option) {
            if (option.contestantId) {
              const contestant = this.db.contestants.get(option.contestantId);
              if (contestant) contestantName = contestant.name;
            }
            if (!contestantName) {
              contestantName = option.text
                .replace(/Save\s*/i, "")
                .replace(/Vote\s*/i, "")
                .replace(/\s*for Captain/i, "")
                .replace(/\s*\([^)]*\)/i, "")
                .trim();
            }
          }

          return {
            hasVoted: true,
            optionId: v.optionId,
            contestantName: contestantName || "your selected housemate",
          };
        }
      }
    }

    return {
      hasVoted: false,
    };
  }

  public createPoll(dto: {
    title: string;
    description?: string;
    category?: string;
    options: { text: string; contestantId?: string; imageUrl?: string }[];
    startsAt?: string;
    endsAt?: string;
  }) {
    const pollId = uuidv4();
    const createdOptions: PollOption[] = [];

    for (const opt of dto.options) {
      const option: PollOption = {
        id: uuidv4(),
        pollId,
        contestantId: opt.contestantId,
        text: opt.text,
        imageUrl: opt.imageUrl,
        votesCount: 0,
      };
      this.db.pollOptions.set(option.id, option);
      createdOptions.push(option);
    }

    const poll: Poll = {
      id: pollId,
      title: dto.title,
      description: dto.description || "",
      category: dto.category || "General",
      status: "ACTIVE",
      totalVotes: 0,
      options: createdOptions,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : new Date(),
      endsAt: dto.endsAt ? new Date(dto.endsAt) : undefined,
      createdAt: new Date(),
    };

    this.db.polls.set(poll.id, poll);
    return poll;
  }

  public updatePollStatus(pollId: string, status: Poll["status"]) {
    const poll = this.db.polls.get(pollId);
    if (!poll) {
      throw new NotFoundException("Poll not found");
    }
    poll.status = status;
    return poll;
  }
}

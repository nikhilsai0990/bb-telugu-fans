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

@Injectable()
export class PollsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly rateLimiter: RedisRateLimiterService,
  ) {}

  public getAllPolls(statusFilter?: string) {
    const list: Poll[] = [];
    for (const poll of this.db.polls.values()) {
      if (!statusFilter || poll.status.toLowerCase() === statusFilter.toLowerCase()) {
        const options = Array.from(this.db.pollOptions.values()).filter((opt) => opt.pollId === poll.id);
        list.push({
          ...poll,
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
    const poll = this.db.polls.get(id);
    if (!poll) {
      throw new NotFoundException("Poll not found");
    }
    const options = Array.from(this.db.pollOptions.values()).filter((opt) => opt.pollId === poll.id);
    return {
      ...poll,
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
    const { pollId, optionId, userId, voterToken, clientIp } = params;

    // 1. Authenticate user identity (Part 9: Anonymous voting is NOT allowed)
    if (!userId) {
      throw new UnauthorizedException("Authentication required to vote. Please sign in or sign up.");
    }

    // 2. Validate Poll Existence
    const poll = this.db.polls.get(pollId);
    if (!poll) {
      throw new NotFoundException("Poll does not exist");
    }

    // 3. Validate Poll Lifecycle
    if (poll.status !== "ACTIVE") {
      if (poll.status === "CLOSED") {
        throw new BadRequestException("This poll is closed. Voting is no longer accepted.");
      }
      throw new BadRequestException(`Poll is currently ${poll.status.toLowerCase()} and cannot accept votes.`);
    }

    // 4. Validate Option Belongs to this Poll
    const option = this.db.pollOptions.get(optionId);
    if (!option || option.pollId !== pollId) {
      throw new BadRequestException("Selected option does not belong to this poll");
    }

    // 5. Validate Contestant is active and not eliminated (Part 27)
    if (option.contestantId) {
      const contestant = this.db.contestants.get(option.contestantId);
      if (!contestant || contestant.status === "ELIMINATED" || contestant.isEliminated || !contestant.isActive) {
        throw new BadRequestException("Voting is not permitted for eliminated contestants.");
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
      contestantName = option.text.replace(/Save\s*/i, "").replace(/\s*\([^)]*\)/i, "").trim();
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
    const { pollId, userId } = params;
    if (!userId) {
      return { hasVoted: false };
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    for (const v of this.db.votes.values()) {
      if (v.pollId === pollId && v.userId === userId) {
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
              contestantName = option.text.replace(/Save\s*/i, "").replace(/\s*\([^)]*\)/i, "").trim();
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

import { Injectable, OnModuleInit } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  avatarUrl?: string;
  bio?: string;
  isBanned: boolean;
  isSuspended: boolean;
  createdAt: Date;
}

export type ContestantTeam = "RED" | "BLUE";
export type ContestantStatus = "ACTIVE" | "NOMINATED" | "EVICTED" | "ELIMINATED" | "CAPTAIN";
export type ContestantRole = "CAPTAIN" | "PLAYER" | "LEADER";
export type ContestantZone = "HIGH_RISK" | "NORMAL" | "HIGH";
export type TaskStatus = "IN_TASK" | "OUT_OF_FIRST_TASK" | "COMPLETED";

export interface Contestant {
  id: string;
  name: string;
  slug: string;
  season: number;
  avatarUrl: string;
  bannerUrl?: string;
  bio: string;
  occupation: string;
  status: ContestantStatus;
  team: ContestantTeam;
  role: ContestantRole;
  isActive: boolean;
  isNominated: boolean;
  zone?: ContestantZone;
  isHighRiskZone?: boolean;
  isHighZone?: boolean;
  isHousemate?: boolean;
  isTaskWinner?: boolean;
  taskTitle?: string;
  taskStatus?: TaskStatus;
  isEliminated?: boolean;
  eliminatedAt?: Date;
  eliminationReason?: string;
  noReentry?: boolean;
  reEntryEligible?: boolean;
  popularityScore: number;
  trend: "UP" | "DOWN" | "STABLE";
  weekNumber: number;
  stats: {
    tasksWon: number;
    nominationsFaced: number;
    timesCaptain: number;
    fanSentimentPositive: number;
    fanSentimentNeutral: number;
    fanSentimentNegative: number;
  };
  createdAt: Date;
}

export interface PollOption {
  id: string;
  pollId: string;
  contestantId?: string;
  text: string;
  imageUrl?: string;
  votesCount: number;
  team?: "RED" | "BLUE";
  zone?: ContestantZone;
  isHighRiskZone?: boolean;
  isHighZone?: boolean;
  taskStatus?: string;
}

export type PollStatus = "DRAFT" | "SCHEDULED" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  status: PollStatus;
  totalVotes: number;
  options: PollOption[];
  startsAt: Date;
  endsAt?: Date;
  createdAt: Date;
}

export interface Vote {
  id: string;
  pollId: string;
  optionId: string;
  userId?: string;
  voterTokenHash?: string;
  ipHash: string;
  createdAt: Date;
}

export interface Post {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  category: string;
  title: string;
  description: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  parentCommentId?: string;
  content: string;
  isDeleted: boolean;
  createdAt: Date;
}

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  imageUrl: string;
  viewsCount: number;
  isTrending: boolean;
  isPublished: boolean;
  publishedAt: Date;
  createdAt: Date;
}

export interface Meme {
  id: string;
  userId: string;
  username: string;
  title: string;
  imageUrl: string;
  likesCount: number;
  isApproved: boolean;
  createdAt: Date;
}

export interface Report {
  id: string;
  userId?: string;
  entityType: "POST" | "COMMENT" | "MEME" | "USER";
  entityId: string;
  reason: string;
  details?: string;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  adminId?: string;
  adminUsername?: string;
  action: string;
  details: any;
  ipHash?: string;
  createdAt: Date;
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  public users: Map<string, User> = new Map();
  public contestants: Map<string, Contestant> = new Map();
  public polls: Map<string, Poll> = new Map();
  public pollOptions: Map<string, PollOption> = new Map();
  public votes: Map<string, Vote> = new Map();
  public posts: Map<string, Post> = new Map();
  public comments: Map<string, Comment> = new Map();
  public postLikes: Set<string> = new Set(); // "postId:userId"
  public postSaves: Set<string> = new Set(); // "postId:userId"
  public news: Map<string, NewsItem> = new Map();
  public memes: Map<string, Meme> = new Map();
  public reports: Map<string, Report> = new Map();
  public auditLogs: AuditLog[] = [];

  // Unique constraint indexes for instant, race-condition safe lookups
  private userPollVotes: Set<string> = new Set(); // "userId:pollId"
  private voterTokenPollVotes: Set<string> = new Set(); // "voterTokenHash:pollId"

  onModuleInit() {
    this.seedInitialData();
    this.resetPollVotes("poll-elimination-week-02");
    this.resetPollVotes("poll-captain-week-02");
    this.resetPollVotes("poll-eviction-01");
  }

  public hashValue(value: string, salt: string = "bb_fans_salt"): string {
    return crypto.createHmac("sha256", salt).update(value).digest("hex");
  }

  // Transaction execution with rollback support
  public async executeTransaction<T>(
    operation: (tx: {
      insertVote: (vote: Omit<Vote, "id" | "createdAt">) => Vote;
      incrementPollVotes: (pollId: string, optionId: string) => void;
    }) => Promise<T>
  ): Promise<T> {
    const backupUserPollVotes = new Set(this.userPollVotes);
    const backupVoterTokenPollVotes = new Set(this.voterTokenPollVotes);
    const addedVoteIds: string[] = [];
    const optionVoteIncrements: { optionId: string; pollId: string }[] = [];

    const txContext = {
      insertVote: (voteData: Omit<Vote, "id" | "createdAt">): Vote => {
        const todayStr = new Date().toISOString().slice(0, 10);

        // 1. Enforce unique constraint for authenticated users (1 vote per user per day)
        if (voteData.userId) {
          const userKey = `${voteData.userId}:${voteData.pollId}:${todayStr}`;
          if (this.userPollVotes.has(userKey)) {
            const err: any = new Error("Unique constraint violation: uq_user_poll");
            err.code = "23505";
            throw err;
          }
          this.userPollVotes.add(userKey);
        }

        // 2. Enforce unique constraint for anonymous voter tokens (1 vote per user per day)
        if (voteData.voterTokenHash) {
          const tokenKey = `${voteData.voterTokenHash}:${voteData.pollId}:${todayStr}`;
          if (this.voterTokenPollVotes.has(tokenKey)) {
            const err: any = new Error("Unique constraint violation: uq_voter_token_poll");
            err.code = "23505";
            throw err;
          }
          this.voterTokenPollVotes.add(tokenKey);
        }

        const vote: Vote = {
          ...voteData,
          id: uuidv4(),
          createdAt: new Date(),
        };
        this.votes.set(vote.id, vote);
        addedVoteIds.push(vote.id);
        return vote;
      },
      incrementPollVotes: (pollId: string, optionId: string) => {
        const poll = this.polls.get(pollId);
        const option = this.pollOptions.get(optionId);
        if (poll && option) {
          poll.totalVotes += 1;
          option.votesCount += 1;
          optionVoteIncrements.push({ optionId, pollId });
        }
      },
    };

    try {
      const result = await operation(txContext);
      return result;
    } catch (error) {
      // Rollback
      for (const id of addedVoteIds) {
        this.votes.delete(id);
      }
      for (const inc of optionVoteIncrements) {
        const poll = this.polls.get(inc.pollId);
        const option = this.pollOptions.get(inc.optionId);
        if (poll && option) {
          poll.totalVotes = Math.max(0, poll.totalVotes - 1);
          option.votesCount = Math.max(0, option.votesCount - 1);
        }
      }
      this.userPollVotes = backupUserPollVotes;
      this.voterTokenPollVotes = backupVoterTokenPollVotes;
      throw error;
    }
  }

  public logAudit(action: string, details: any, adminId?: string, adminUsername?: string, ipHash?: string) {
    const log: AuditLog = {
      id: uuidv4(),
      adminId,
      adminUsername,
      action,
      details,
      ipHash,
      createdAt: new Date(),
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }

  public resetPollVotes(pollId: string) {
    const poll = this.polls.get(pollId);
    if (poll) {
      poll.totalVotes = 0;
    }
    for (const opt of this.pollOptions.values()) {
      if (opt.pollId === pollId) {
        opt.votesCount = 0;
      }
    }
    for (const [id, v] of this.votes.entries()) {
      if (v.pollId === pollId) {
        this.votes.delete(id);
      }
    }
    for (const key of Array.from(this.userPollVotes)) {
      if (key.includes(pollId)) {
        this.userPollVotes.delete(key);
      }
    }
    for (const key of Array.from(this.voterTokenPollVotes)) {
      if (key.includes(pollId)) {
        this.voterTokenPollVotes.delete(key);
      }
    }
  }

  public seedInitialData() {
    // 1. Single Real Admin Account (nikhil)
    const adminUsername = (process.env.ADMIN_USERNAME || "nikhil").trim();
    const adminEmail = (process.env.ADMIN_EMAIL || `${adminUsername}@bbtelugufans.com`).trim().toLowerCase();
    const adminPasswordHash =
      process.env.ADMIN_PASSWORD_HASH ||
      (process.env.ADMIN_PASSWORD
        ? this.hashValue(process.env.ADMIN_PASSWORD, "bb_fans_pwd_salt")
        : this.hashValue("AdminBBTelugu2026!", "bb_fans_pwd_salt"));

    const adminUser: User = {
      id: "admin-user-001",
      username: adminUsername,
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      bio: "Administrator for BB Telugu Fans platform.",
      isBanned: false,
      isSuspended: false,
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    const fanUser: User = {
      id: "fan-user-001",
      username: "TeluguBigBossLover",
      email: "fan@bbtelugufans.com",
      passwordHash: this.hashValue("FanPass2026!", "bb_fans_pwd_salt"),
      role: "USER",
      avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
      bio: "Die-hard BB Telugu fan since Season 1. Analyzing house dynamics 24/7!",
      isBanned: false,
      isSuspended: false,
      createdAt: new Date(),
    };
    this.users.set(fanUser.id, fanUser);

    // 2. Canonical Season 10 Master Roster (16 Contestants)
    // EXACTLY 14 ACTIVE CONTESTANTS, 2 ELIMINATED CONTESTANTS (Charan & Chaitra Rai).
    // The competition is now purely INDIVIDUAL with NO teams and NO team leaders.
    // TASK WINNER: Auto Ram Prasad (tasksWon = 1).
    // CURRENT HOUSEMATES: Rohit Naidu, Auto Ram Prasad, Temper Vamsi.
    // 2. Canonical Season 10 Master Roster (16 Housemates)
    // EXACTLY 14 ACTIVE HOUSEMATES, 2 ELIMINATED HOUSEMATES (Charan & Chaitra Rai).
    // ALL 16 participants are treated as HOUSEMATES (isHousemate: true).
    // NO TEAM LEADERS: All leadership roles removed completely.
    // ZERO NOMINATIONS: isNominated = false for all housemates.
    // TASK WINNERS: Auto Ram Prasad (1), Rohit Naidu (1), Temper Vamsi (1) -> Label MUST be "TASK WINNER".
    // ELIMINATED: Charan and Chaitra Rai (noReentry: true, reEntryEligible: false). Not in active poll.
    const contestantsList: Contestant[] = [
      {
        id: "c-11",
        name: "Rohit Naidu",
        slug: "rohit-naidu",
        season: 10,
        team: "RED",
        role: "PLAYER",
        isHousemate: true,
        isTaskWinner: true,
        taskTitle: "TASK WINNER",
        avatarUrl: "/images/contestants/rohit-naidu.webp",
        bio: "Product Manager • Commoner and Task Winner, navigating the house with strategic composure and athletic dedication.",
        occupation: "Product Manager • Commoner",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 1,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-12",
        name: "Aman",
        slug: "aman",
        season: 10,
        team: "RED",
        role: "PLAYER",
        isHousemate: true,
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        avatarUrl: "/images/contestants/aman.webp",
        bio: "Short Film Actor • Commoner competing as an active housemate.",
        occupation: "Short Film Actor • Commoner",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-14",
        name: "Shalini",
        slug: "shalini",
        season: 10,
        team: "RED",
        role: "PLAYER",
        isHousemate: true,
        avatarUrl: "/images/contestants/shalini.webp",
        bio: "Commoner voicing unfiltered perspectives as an active housemate.",
        occupation: "Commoner",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-16",
        name: "Singer Jhansi",
        slug: "singer-jhansi",
        season: 10,
        team: "RED",
        role: "PLAYER",
        isHousemate: true,
        avatarUrl: "/images/contestants/singer-jhansi.webp",
        bio: "Singer • Commoner infusing the house with cultural resonance, melody, and authenticity.",
        occupation: "Singer • Commoner",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-07",
        name: "Temper Vamsi",
        slug: "temper-vamsi",
        season: 10,
        team: "RED",
        role: "PLAYER",
        isHousemate: true,
        isTaskWinner: true,
        taskTitle: "TASK WINNER",
        avatarUrl: "/images/contestants/temper-vamsi.webp",
        bio: "High-octane character actor and Task Winner bringing fierce fighting spirit and energy.",
        occupation: "Character Actor",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 1,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-10",
        name: "Chaitra Rai",
        slug: "chaitra-rai",
        season: 10,
        team: "RED",
        role: "PLAYER",
        isHousemate: true,
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        avatarUrl: "/images/contestants/chaitra-rai.webp",
        bio: "Experienced television actress. Officially eliminated from Bigg Boss Telugu Season 10 based on housemates' votes. No re-entry.",
        occupation: "Television Actress",
        status: "ELIMINATED",
        isActive: false,
        isNominated: false,
        isEliminated: true,
        noReentry: true,
        reEntryEligible: false,
        eliminatedAt: new Date(),
        eliminationReason: "Eliminated based on housemates' votes. No re-entry.",
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 1,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-15",
        name: "Srushti Vyakaranam",
        slug: "srushti-vyakaranam",
        season: 10,
        team: "RED",
        role: "PLAYER",
        isHousemate: true,
        avatarUrl: "/images/contestants/srushti-vyakaranam.webp",
        bio: "Commoner showcasing strategic poise, game reading, and mental resilience.",
        occupation: "Commoner",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-13",
        name: "Charan",
        slug: "charan",
        season: 10,
        team: "RED",
        role: "PLAYER",
        isHousemate: true,
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        avatarUrl: "/images/contestants/charan.webp",
        bio: "Spirited RJ and youth presenter. Officially eliminated from Bigg Boss Telugu Season 10 based on housemates' votes. No re-entry.",
        occupation: "Radio Jockey",
        status: "ELIMINATED",
        isActive: false,
        isNominated: false,
        isEliminated: true,
        noReentry: true,
        reEntryEligible: false,
        eliminatedAt: new Date(),
        eliminationReason: "Eliminated based on housemates' votes. No re-entry.",
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 1,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },

      // --- BLUE HOUSEMATES ---
      {
        id: "c-02",
        name: "Auto Ram Prasad",
        slug: "auto-ram-prasad",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        isHousemate: true,
        isTaskWinner: true,
        taskTitle: "TASK WINNER",
        avatarUrl: "/images/contestants/auto-ram-prasad.webp",
        bio: "Celebrated Jabardasth punchline king and Task Winner, competing as an active housemate.",
        occupation: "Stand-up Comedian & Writer",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 1,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-04",
        name: "Thrigun",
        slug: "thrigun",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        isHousemate: true,
        avatarUrl: "/images/contestants/thrigun.webp",
        bio: "Dynamic Tollywood actor bringing physical stamina and dedication to the house.",
        occupation: "Film Actor",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-05",
        name: "Mukesh Gowda",
        slug: "mukesh-gowda",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        isHousemate: true,
        avatarUrl: "/images/contestants/mukesh-gowda.webp",
        bio: "Beloved television actor bringing dignified strength and poise to the game.",
        occupation: "Television Actor",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-09",
        name: "Sudheer Kumar Reddy",
        slug: "sudheer-kumar-reddy",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        isHousemate: true,
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        avatarUrl: "/images/contestants/sudheer-kumar-reddy.webp",
        bio: "Digital creator and voice of 'Sudheer Talks' competing as an active housemate.",
        occupation: "Podcaster & Creator",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-03",
        name: "Jabardasth Naresh",
        slug: "jabardasth-naresh",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        isHousemate: true,
        avatarUrl: "/images/contestants/jabardasth-naresh.webp",
        bio: "Beloved comedy dynamo and audience favorite providing spontaneous humor and charisma.",
        occupation: "Comedian & Entertainer",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-06",
        name: "Varshini Sounderajan",
        slug: "varshini-sounderajan",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        isHousemate: true,
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        avatarUrl: "/images/contestants/varshini-sounderajan.webp",
        bio: "Spirited television host with sharp verbal clarity and charisma competing as an active housemate.",
        occupation: "TV Anchor & Actress",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-01",
        name: "Debjani Modak",
        slug: "debjani-modak",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        isHousemate: true,
        avatarUrl: "/images/contestants/debjani-modak.webp",
        bio: "Graceful television serial actress competing in the house with determination.",
        occupation: "Television Actress",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
      {
        id: "c-08",
        name: "Krishnudu",
        slug: "krishnudu",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        isHousemate: true,
        avatarUrl: "/images/contestants/krishnudu.webp",
        bio: "Veteran Tollywood actor spreading calm presence, warmth, and mature guidance.",
        occupation: "Film Actor",
        status: "ACTIVE",
        isActive: true,
        isNominated: false,
        isEliminated: false,
        noReentry: false,
        reEntryEligible: true,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 0,
          nominationsFaced: 0,
          timesCaptain: 0,
          fanSentimentPositive: 0,
          fanSentimentNeutral: 0,
          fanSentimentNegative: 0,
        },
        createdAt: new Date(),
      },
    ];

    for (const c of contestantsList) {
      c.zone = "NORMAL";
      c.isHighRiskZone = false;
      c.isHighZone = false;
      c.isHousemate = true;
      this.contestants.set(c.id, c);
    }

    // 3. Official Season 10 Polls
    // WEEK 2 — "POWER OF PEOPLE" / "WHO WILL BE ELIMINATED THIS WEEK?"
    // Poll ID: poll-elimination-week-02
    // Title: WHO WILL BE ELIMINATED THIS WEEK?
    // Description: Vote for the housemate you think will be eliminated this week.
    // Category: Elimination
    // Contains ONLY the remaining active contestants after excluding:
    // Aman (c-12), Jabardasth Naresh (c-03), Temper Vamsi (c-07), Charan (c-13), Chaitra Rai (c-10).
    // Exactly 11 eligible housemates. Starts with 0 votes, 0%. Status is ACTIVE.
    const pollEliminationId = "poll-elimination-week-02";
    const canonicalPollContestantsOrder = [
      "c-01", // Debjani Modak
      "c-02", // Auto Ram Prasad
      // c-03 Jabardasth Naresh - EXCLUDED from Week 2 Elimination Poll
      "c-04", // Thrigun
      "c-05", // Mukesh Gowda
      "c-06", // Varshini Sounderajan
      // c-07 Temper Vamsi - EXCLUDED from Week 2 Elimination Poll
      "c-08", // Krishnudu
      "c-09", // Sudheer Kumar Reddy
      // c-10 Chaitra Rai is ELIMINATED - Excluded from poll!
      "c-11", // Rohit Naidu
      // c-12 Aman - EXCLUDED from Week 2 Elimination Poll
      // c-13 Charan is ELIMINATED - Excluded from poll!
      "c-14", // Shalini
      "c-15", // Srushti Vyakaranam
      "c-16", // Singer Jhansi
    ];

    const eliminationPollOptions: PollOption[] = canonicalPollContestantsOrder.map((cId) => {
      const c = this.contestants.get(cId)!;
      return {
        id: `opt-elim-${c.id}`,
        pollId: pollEliminationId,
        contestantId: c.id,
        text: `Vote ${c.name}`,
        imageUrl: c.avatarUrl,
        team: c.team,
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        votesCount: 0,
      };
    });

    for (const opt of eliminationPollOptions) {
      this.pollOptions.set(opt.id, opt);
      // Support legacy option id references
      this.pollOptions.set(`opt-captain-${opt.contestantId}`, opt);
    }

    const pollElimination: Poll = {
      id: pollEliminationId,
      title: "WHO WILL BE ELIMINATED THIS WEEK?",
      description: "Vote for the housemate you think will be eliminated this week.",
      category: "Elimination",
      status: "ACTIVE",
      totalVotes: 0,
      options: eliminationPollOptions,
      startsAt: new Date("2026-09-13T00:00:00+05:30"),
      endsAt: new Date("2026-09-18T23:59:59+05:30"),
      createdAt: new Date("2026-09-13T00:00:00+05:30"),
    };
    this.polls.set(pollElimination.id, pollElimination);
    this.polls.set("poll-captain-week-02", pollElimination);

    // Historical Week 1 Save Poll — Retained for backward compatibility (14 active housemates)
    const pollSaveId = "poll-eviction-01";
    const week1ActiveContestantIds = [
      "c-01", "c-02", "c-03", "c-04", "c-05", "c-06", "c-07", "c-08", "c-09", "c-11", "c-12", "c-14", "c-15", "c-16"
    ];
    const pollOptions: PollOption[] = week1ActiveContestantIds.map((cId) => {
      const c = this.contestants.get(cId)!;
      return {
        id: `opt-save-${c.id}`,
        pollId: pollSaveId,
        contestantId: c.id,
        text: `Save ${c.name}`,
        imageUrl: c.avatarUrl,
        team: c.team,
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        votesCount: 0,
      };
    });

    for (const opt of pollOptions) {
      this.pollOptions.set(opt.id, opt);
    }

    const pollSave: Poll = {
      id: pollSaveId,
      title: "Who Should Be Saved?",
      description: "14 active housemates. Voting is currently closed.",
      category: "Nominations",
      status: "CLOSED",
      totalVotes: 0,
      options: pollOptions,
      startsAt: new Date(Date.now() - 86400000 * 2),
      endsAt: new Date(Date.now() - 86400000),
      createdAt: new Date(Date.now() - 86400000 * 2),
    };
    this.polls.set(pollSave.id, pollSave);

    // 4. Official Season 10 News Dispatches (Week 2 Updates + Historical Stories)
    const newsItems: NewsItem[] = [
      {
        id: "news-w02-01",
        title: "Shalini vs Varshini: Big Fight",
        slug: "shalini-vs-varshini-big-fight",
        summary: "Shalini and Varshini had a major confrontation in the house.",
        content: "Shalini and Varshini had a major confrontation in the house.",
        category: "House Dynamics",
        imageUrl: "/images/contestants/shalini.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 30),
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: "news-w02-02",
        title: "Sudheer & Thrigun During Nominations",
        slug: "sudheer-and-thrigun-during-nominations",
        summary: "Sudheer and Thrigun were involved during the nomination process.",
        content: "Sudheer and Thrigun were involved during the nomination process.",
        category: "Nominations",
        imageUrl: "/images/contestants/sudheer-kumar-reddy.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60),
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        id: "news-01",
        title: "No Elimination on Sunday",
        slug: "no-elimination-on-sunday",
        summary: "Bigg Boss Telugu Season 10 sees no eviction this Sunday as all 14 active housemates are declared safe.",
        content: `In an unexpected turn of events during the weekend episode of Bigg Boss Telugu Season 10, it was announced that there will be no elimination this Sunday. All 14 active housemates remain safe in the house as the game intensifies.`,
        category: "Evictions",
        imageUrl: "/images/contestants/debjani-modak.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id: "news-02",
        title: "Srushti Vyakaranam lost the Power Key due to housemates' votes.",
        slug: "srushti-vyakaranam-lost-the-power-key-due-to-housemates-votes",
        summary: "Following a decisive house vote, Srushti Vyakaranam loses the coveted Power Key.",
        content: `Tensions flared inside the Bigg Boss Telugu Season 10 house during the Power Key review session. Based on majority votes from fellow housemates, Srushti Vyakaranam had to surrender the Power Key, shaking up house dynamics and alliances.`,
        category: "Tasks",
        imageUrl: "/images/contestants/srushti-vyakaranam.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
      },
      {
        id: "news-03",
        title: "Sudheer Kumar Reddy won.",
        slug: "sudheer-kumar-reddy-won",
        summary: "Sudheer Kumar Reddy clinches a hard-fought challenge inside the Bigg Boss Telugu house.",
        content: `Sudheer Kumar Reddy showcased exceptional stamina and tactical sharpness to secure a crucial individual victory in the arena. His win provides a major morale boost amidst fierce competition among the active housemates.`,
        category: "Tasks",
        imageUrl: "/images/contestants/sudheer-kumar-reddy.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
      {
        id: "news-04",
        title: "Krishnudu's team won the task against Naresh's team.",
        slug: "krishnudus-team-won-the-task-against-nareshs-team",
        summary: "Team B led by Krishnudu overcomes Team A led by Naresh in a dramatic team showdown.",
        content: `The latest team challenge delivered edge-of-the-seat drama as Team A (Naresh) clashed with Team B (Krishnudu). Displaying superior coordination and tenacity, Krishnudu's team triumphed over Naresh's team to claim victory.`,
        category: "Tasks",
        imageUrl: "/images/contestants/krishnudu.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
      {
        id: "news-05",
        title: "No re-entry for Chaitra Rai and Charan.",
        slug: "no-re-entry-for-chaitra-rai-and-charan",
        summary: "Bigg Boss confirms that eliminated housemates Chaitra Rai and Charan will have no re-entry into the house.",
        content: `Following their exit based on housemates' votes, Bigg Boss has confirmed that neither Chaitra Rai nor Charan will be granted re-entry into the Season 10 house. The competition moves forward strictly with the 14 active housemates.`,
        category: "Evictions",
        imageUrl: "/images/contestants/chaitra-rai.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      },
    ];

    for (const item of newsItems) {
      this.news.set(item.id, item);
    }

    // 5. Discussion Posts (Clean fan community discussions aligned with Season 10)
    const post1: Post = {
      id: "post-01",
      userId: fanUser.id,
      username: fanUser.username,
      userAvatar: fanUser.avatarUrl,
      category: "Fan Theories",
      title: "Task Winners & Season 10 Housemates: Who is making the biggest impact?",
      description: "Auto Ram Prasad, Rohit Naidu, and Temper Vamsi have all won tasks in Week 1. Who is your top pick?",
      likesCount: 0,
      commentsCount: 0,
      isPinned: true,
      isDeleted: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    };
    this.posts.set(post1.id, post1);

    const post2: Post = {
      id: "post-02",
      userId: adminUser.id,
      username: adminUser.username,
      userAvatar: adminUser.avatarUrl,
      category: "Nominations",
      title: "14 Active Housemates in the Arena: Cast your vote when polls are open!",
      description: "With Charan and Chaitra Rai eliminated (no re-entry), 14 housemates remain in the competition. Voting is currently closed for Sunday.",
      likesCount: 0,
      commentsCount: 0,
      isPinned: true,
      isDeleted: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    };
    this.posts.set(post2.id, post2);

    // 6. Memes — Per Section 23: EMPTY STATE ONLY!
    // No fake memes, no fake likes, no fake counts.
    this.memes.clear();
  }
}

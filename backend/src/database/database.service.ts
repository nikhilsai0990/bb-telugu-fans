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
    // EXACTLY THREE in HIGH RISK ZONE: Aman, Sudheer Kumar Reddy, and Varshini Sounderajan.
    // TASK WINNER: Auto Ram Prasad (tasksWon = 1).
    // CURRENT HOUSEMATES: Rohit Naidu, Auto Ram Prasad, Temper Vamsi.
    // CONTESTANTS: All other active contenders.
    // ELIMINATED: Charan and Chaitra Rai. Not in active poll, not in High Risk Zone.
    const contestantsList: Contestant[] = [
      {
        id: "c-11",
        name: "Rohit Naidu",
        slug: "rohit-naidu",
        season: 10,
        team: "RED",
        role: "PLAYER",
        isHousemate: true,
        avatarUrl: "/images/contestants/rohit-naidu.webp",
        bio: "Model and television star navigating the house with strategic composure as an individual contender.",
        occupation: "Model & Television Star",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-12",
        name: "Aman",
        slug: "aman",
        season: 10,
        team: "RED",
        role: "PLAYER",
        zone: "HIGH_RISK",
        isHighRiskZone: true,
        isHighZone: true,
        avatarUrl: "/images/contestants/aman.webp",
        bio: "Athletic model and fitness athlete currently in the High Risk Zone as an active nominated individual housemate.",
        occupation: "Fitness Athlete",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-14",
        name: "Shalini",
        slug: "shalini",
        season: 10,
        team: "RED",
        role: "PLAYER",
        avatarUrl: "/images/contestants/shalini.webp",
        bio: "Bold digital model voicing unfiltered perspectives in the individual arena.",
        occupation: "Fashion Model",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-16",
        name: "Singer Jhansi",
        slug: "singer-jhansi",
        season: 10,
        team: "RED",
        role: "PLAYER",
        avatarUrl: "/images/contestants/singer-jhansi.webp",
        bio: "Soulful Telugu folk and playback singer infusing the house with cultural resonance and melody.",
        occupation: "Folk & Playback Singer",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-07",
        name: "Temper Vamsi",
        slug: "temper-vamsi",
        season: 10,
        team: "RED",
        role: "PLAYER",
        isHousemate: true,
        avatarUrl: "/images/contestants/temper-vamsi.webp",
        bio: "High-octane character actor bringing fierce fighting spirit to the individual competition.",
        occupation: "Character Actor",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-10",
        name: "Chaitra Rai",
        slug: "chaitra-rai",
        season: 10,
        team: "RED",
        role: "PLAYER",
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        avatarUrl: "/images/contestants/chaitra-rai.webp",
        bio: "Experienced television actress. Officially eliminated from Bigg Boss Telugu Season 10 based on housemates' votes.",
        occupation: "Television Actress",
        status: "ELIMINATED",
        isActive: false,
        isNominated: false,
        isEliminated: true,
        eliminatedAt: new Date(),
        eliminationReason: "Eliminated based on housemates' votes",
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
        avatarUrl: "/images/contestants/srushti-vyakaranam.webp",
        bio: "Miss India Asia Pacific 2016 showcasing strategic poise, game reading, and mental resilience.",
        occupation: "International Model",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-13",
        name: "Charan",
        slug: "charan",
        season: 10,
        team: "RED",
        role: "PLAYER",
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        avatarUrl: "/images/contestants/charan.webp",
        bio: "Spirited RJ and youth presenter. Officially eliminated from Bigg Boss Telugu Season 10 based on housemates' votes.",
        occupation: "Radio Jockey",
        status: "ELIMINATED",
        isActive: false,
        isNominated: false,
        isEliminated: true,
        eliminatedAt: new Date(),
        eliminationReason: "Eliminated based on housemates' votes",
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

      // --- INDIVIDUAL CONTESTANTS (FORMER BLUE MEMBERS) ---
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
        bio: "Celebrated Jabardasth punchline king and Task Winner, competing as an active nominated individual housemate.",
        occupation: "Stand-up Comedian & Writer",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
        popularityScore: 0,
        trend: "STABLE",
        weekNumber: 1,
        stats: {
          tasksWon: 1,
          nominationsFaced: 1,
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
        avatarUrl: "/images/contestants/thrigun.webp",
        bio: "Dynamic Tollywood actor bringing physical stamina and dedication to the arena.",
        occupation: "Film Actor",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-05",
        name: "Mukesh Gowda",
        slug: "mukesh-gowda",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        zone: "NORMAL",
        isHighRiskZone: false,
        isHighZone: false,
        avatarUrl: "/images/contestants/mukesh-gowda.webp",
        bio: "Beloved television actor bringing dignified strength and poise to the individual game.",
        occupation: "Television Actor",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-09",
        name: "Sudheer Kumar Reddy",
        slug: "sudheer-kumar-reddy",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        zone: "HIGH_RISK",
        isHighRiskZone: true,
        isHighZone: true,
        avatarUrl: "/images/contestants/sudheer-kumar-reddy.webp",
        bio: "Digital creator and voice of 'Sudheer Talks' currently in the High Risk Zone as an active nominated individual housemate.",
        occupation: "Podcaster & Creator",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-03",
        name: "Jabardasth Naresh",
        slug: "jabardasth-naresh",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        avatarUrl: "/images/contestants/jabardasth-naresh.webp",
        bio: "Beloved comedy dynamo and audience favorite providing spontaneous humor and charisma.",
        occupation: "Comedian & Entertainer",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-06",
        name: "Varshini Sounderajan",
        slug: "varshini-sounderajan",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        zone: "HIGH_RISK",
        isHighRiskZone: true,
        isHighZone: true,
        avatarUrl: "/images/contestants/varshini-sounderajan.webp",
        bio: "Spirited television host with sharp verbal clarity, fearless debate presence, and magnetic charisma currently in the High Risk Zone as an active nominated individual contender.",
        occupation: "TV Anchor & Actress",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-01",
        name: "Debjani Modak",
        slug: "debjani-modak",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        avatarUrl: "/images/contestants/debjani-modak.webp",
        bio: "Graceful television serial actress competing as an active nominated individual housemate.",
        occupation: "Television Actress",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
        id: "c-08",
        name: "Krishnudu",
        slug: "krishnudu",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        avatarUrl: "/images/contestants/krishnudu.webp",
        bio: "Veteran Tollywood actor spreading calm presence, warmth, and mature guidance.",
        occupation: "Film Actor",
        status: "NOMINATED",
        isActive: true,
        isNominated: true,
        isEliminated: false,
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
    ];

    for (const c of contestantsList) {
      c.zone = c.zone || "NORMAL";
      c.isHighRiskZone = c.zone === "HIGH_RISK";
      c.isHighZone = c.zone === "HIGH_RISK";
      this.contestants.set(c.id, c);
    }

    // 3. Official Season 10 Poll — ONLY "WHO SHOULD BE SAVED?"
    // Contains EXACTLY the 14 active nominated contestants (Charan and Chaitra Rai are ELIMINATED and excluded).
    // Clean neutral voting state — 0 fake votes!
    const pollSaveId = "poll-eviction-01";
    const canonicalPollContestantsOrder = [
      "c-01", // Debjani Modak
      "c-02", // Auto Ram Prasad
      "c-03", // Jabardasth Naresh
      "c-04", // Thrigun
      "c-05", // Mukesh Gowda
      "c-06", // Varshini Sounderajan
      "c-07", // Temper Vamsi
      "c-08", // Krishnudu
      "c-09", // Sudheer Kumar Reddy (HIGH RISK ZONE)
      // c-10 Chaitra Rai is ELIMINATED - Excluded from poll!
      "c-11", // Rohit Naidu
      "c-12", // Aman (HIGH RISK ZONE)
      // c-13 Charan is ELIMINATED - Excluded from poll!
      "c-14", // Shalini
      "c-15", // Srushti Vyakaranam
      "c-16", // Singer Jhansi
    ];

    const pollOptions: PollOption[] = canonicalPollContestantsOrder.map((cId) => {
      const c = this.contestants.get(cId)!;
      return {
        id: `opt-save-${c.id}`,
        pollId: pollSaveId,
        contestantId: c.id,
        text: `Save ${c.name}`,
        imageUrl: c.avatarUrl,
        team: c.team,
        zone: c.zone,
        isHighRiskZone: c.isHighRiskZone,
        isHighZone: c.isHighRiskZone,
        votesCount: 0,
      };
    });

    for (const opt of pollOptions) {
      this.pollOptions.set(opt.id, opt);
    }

    const pollSave: Poll = {
      id: pollSaveId,
      title: "Who Should Be Saved?",
      description: "14 active housemates are currently nominated! Cast your verified fan vote to save your favorite housemate (1 vote per day).",
      category: "Nominations",
      status: "ACTIVE",
      totalVotes: 0,
      options: pollOptions,
      startsAt: new Date(Date.now() - 86400000),
      endsAt: new Date(Date.now() + 86400000 * 5),
      createdAt: new Date(Date.now() - 86400000),
    };
    this.polls.set(pollSave.id, pollSave);

    // 4. Official Season 10 News Dispatches
    const newsItems: NewsItem[] = [
      {
        id: "news-01",
        title: "CHAITRA RAI AND CHARAN ELIMINATED FROM BIGG BOSS BASED ON HOUSEMATES' VOTES",
        slug: "chaitra-rai-and-charan-eliminated-from-bigg-boss-based-on-housemates-votes",
        summary: "Charan and Chaitra Rai have both been officially eliminated from Bigg Boss Telugu Season 10, leaving 14 active housemates in the individual competition.",
        content: `In a dramatic turn of events in Bigg Boss Telugu Season 10, both Charan and Chaitra Rai have been officially eliminated from the house based on housemates' votes.

With Charan and Chaitra Rai evicted, 14 active contestants remain in the competition. The official voting poll has been updated to reflect the 14 active nominated housemates, and voting is open with 1 vote per authenticated account.`,
        category: "Evictions",
        imageUrl: "/images/contestants/chaitra-rai.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
      {
        id: "news-02",
        title: "AUTO RAM PRASAD NAMED TASK WINNER IN DOMINANT INDIVIDUAL ARENA DISPLAY",
        slug: "auto-ram-prasad-named-task-winner-in-dominant-individual-arena-display",
        summary: "Auto Ram Prasad clinches victory as Task Winner, securing an individual achievement award in Season 10.",
        content: `Auto Ram Prasad has emerged triumphant in the arena challenge of Bigg Boss Telugu Season 10.

Delivering an extraordinary performance, Auto Ram Prasad secured Task Winner honors as an individual achievement. His victory establishes momentum as the 14 active housemates face public voting.`,
        category: "Tasks",
        imageUrl: "/images/contestants/auto-ram-prasad.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
      {
        id: "news-03",
        title: "AMAN, SUDHEER KUMAR REDDY, AND VARSHINI SOUNDERAJAN ENTER HIGH RISK ZONE",
        slug: "aman-sudheer-kumar-reddy-and-varshini-sounderajan-enter-high-risk-zone",
        summary: "Aman, Sudheer Kumar Reddy, and Varshini Sounderajan are the three contestants currently in the High Risk Zone. All remain active, nominated housemates.",
        content: `The Bigg Boss Telugu Season 10 High Risk Zone is set: Aman, Sudheer Kumar Reddy, and Varshini Sounderajan occupy the three positions.

Exactly three contestants currently occupy the High Risk Zone: Aman, Sudheer Kumar Reddy, and Varshini Sounderajan. High Risk Zone indicates danger of eviction but does NOT mean elimination; all three are active, nominated housemates eligible for public votes in the save poll. Auto Ram Prasad, Mukesh Gowda, Charan, and Chaitra Rai are NOT in the High Risk Zone.`,
        category: "Nominations",
        imageUrl: "/images/contestants/aman.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      },
      {
        id: "news-04",
        title: "COMPETITION TRANSITIONS TO INDIVIDUAL BATTLE AS 14 HOUSEMATES REMAIN",
        slug: "competition-transitions-to-individual-battle-as-14-housemates-remain",
        summary: "Teams are dissolved as Bigg Boss Telugu Season 10 becomes an all-out individual contest among the 14 active housemates.",
        content: `Bigg Boss Telugu Season 10 has eliminated team divisions. The competition is now purely individual, with each of the 14 active housemates battling on their own merit.

Fans can support their favorites through the verified fan voting system, with exactly 1 vote per user per day allowed.`,
        category: "House Dynamics",
        imageUrl: "/images/contestants/debjani-modak.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 7),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7),
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
      title: "Auto Ram Prasad Task Winner: Can he survive the individual competition?",
      description: "Auto Ram Prasad is the Task Winner, while Aman, Sudheer Kumar Reddy, and Varshini Sounderajan are in the High Risk Zone. With Charan and Chaitra Rai eliminated, who is your top pick?",
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
      title: "14 Active Contestants Nominated: Cast your 1 vote per day to save your favorite!",
      description: "With Charan and Chaitra Rai eliminated, 14 housemates are on the voting block. Who are you supporting today? Remember: 1 vote per authenticated user per day!",
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

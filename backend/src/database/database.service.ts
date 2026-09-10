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
    // 15 ACTIVE CONTESTANTS, 1 ELIMINATED CONTESTANT (Charan).
    // Exactly TWO teams of 8:
    // RED TEAM (8): Rohit Naidu (LEADER, Task 1 Winner), Aman, Shalini, Singer Jhansi, Temper Vamsi (Task 1 Winner), Chaitra Rai (HIGH RISK ZONE), Srushti Vyakaranam, Charan (ELIMINATED)
    // BLUE TEAM (8): Debjani Modak (LEADER), Auto Ram Prasad (HIGH RISK ZONE), Thrigun (Task 1 Participant), Mukesh Gowda (Task 1 Participant), Sudheer Kumar Reddy, Jabardasth Naresh, Varshini Sounderajan, Krishnudu
    // Red Team Won Task 1: Rohit Naidu & Temper Vamsi represented Red Team (WIN). Thrigun & Mukesh Gowda represented Blue Team (LOSS).
    // Exactly TWO in HIGH RISK ZONE: Auto Ram Prasad (Blue Team) and Chaitra Rai (Red Team) — both ACTIVE housemates, neither eliminated.
    // Red Team Leader: Rohit Naidu. Blue Team Leader: Debjani Modak. (Auto Ram Prasad is NOT captain/leader).
    // Charan is ELIMINATED based on housemates' votes; not in High Risk Zone; cannot receive votes.
    const contestantsList: Contestant[] = [
      // --- RED TEAM (8 Total: 7 Active, 1 Eliminated) ---
      {
        id: "c-11",
        name: "Rohit Naidu",
        slug: "rohit-naidu",
        season: 10,
        team: "RED",
        role: "LEADER",
        avatarUrl: "/images/contestants/rohit-naidu.webp",
        bio: "Red Team Leader who represented Red Team and won Task 1 alongside Temper Vamsi, guiding the squad with strategic composure.",
        occupation: "Model & Television Star",
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
        id: "c-12",
        name: "Aman",
        slug: "aman",
        season: 10,
        team: "RED",
        role: "PLAYER",
        avatarUrl: "/images/contestants/aman.webp",
        bio: "Athletic model and fitness standout bringing explosive power and discipline to the Red Team camp.",
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
        bio: "Bold digital model and Agnipariksha contender voicing fierce, unfiltered perspectives for the Red Team.",
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
        bio: "Soulful Telugu folk and playback singer infusing the Red Team with cultural resonance, melody, and grounded warmth.",
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
        avatarUrl: "/images/contestants/temper-vamsi.webp",
        bio: "High-octane character actor who represented Red Team and won Task 1 alongside Rohit Naidu, bringing fierce fighting spirit.",
        occupation: "Character Actor",
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
        id: "c-10",
        name: "Chaitra Rai",
        slug: "chaitra-rai",
        season: 10,
        team: "RED",
        role: "PLAYER",
        zone: "HIGH_RISK",
        isHighRiskZone: true,
        isHighZone: false,
        avatarUrl: "/images/contestants/chaitra-rai.webp",
        bio: "Experienced serial lead currently in the High Risk Zone alongside Auto Ram Prasad, remaining an active, nominated Red Team housemate.",
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
        id: "c-15",
        name: "Srushti Vyakaranam",
        slug: "srushti-vyakaranam",
        season: 10,
        team: "RED",
        role: "PLAYER",
        avatarUrl: "/images/contestants/srushti-vyakaranam.webp",
        bio: "Miss India Asia Pacific 2016 showcasing strategic poise, keen game reading, and mental resilience in Red Team.",
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
        bio: "Spirited RJ and youth presenter. Eliminated from Season 10 based on housemates' votes.",
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

      // --- BLUE TEAM (8 Total) ---
      {
        id: "c-02",
        name: "Auto Ram Prasad",
        slug: "auto-ram-prasad",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        zone: "HIGH_RISK",
        isHighRiskZone: true,
        isHighZone: false,
        avatarUrl: "/images/contestants/auto-ram-prasad.webp",
        bio: "Celebrated Jabardasth punchline king currently in the High Risk Zone alongside Chaitra Rai, remaining an active, nominated Blue Team housemate.",
        occupation: "Stand-up Comedian & Writer",
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
        id: "c-04",
        name: "Thrigun",
        slug: "thrigun",
        season: 10,
        team: "BLUE",
        role: "PLAYER",
        avatarUrl: "/images/contestants/thrigun.webp",
        bio: "Dynamic Tollywood actor who represented Blue Team in Task 1, bringing physical stamina and dedication to the camp.",
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
        bio: "Beloved 'Rishi Sir' of Telugu television who represented Blue Team in Task 1, bringing dignified strength and poise to the camp.",
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
        avatarUrl: "/images/contestants/sudheer-kumar-reddy.webp",
        bio: "Digital creator and voice of 'Sudheer Talks' delivering sharp analytical strategy and teamwork to Blue Team.",
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
        bio: "Beloved comedy dynamo and audience favorite providing morale, spontaneous humor, and quick coordination to Blue Team.",
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
        avatarUrl: "/images/contestants/varshini-sounderajan.webp",
        bio: "Spirited television host with sharp verbal clarity, fearless debate presence, and magnetic charisma in Blue Team.",
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
        role: "LEADER",
        avatarUrl: "/images/contestants/debjani-modak.webp",
        bio: "Graceful serial actress serving as the Blue Team Leader, bringing poise, emotive depth, and strategic direction to her camp.",
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
        bio: "Veteran Tollywood actor spreading calm presence, warmth, and mature guidance among his Blue Team mates.",
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
    // Contains EXACTLY the 15 active nominated contestants (Charan is ELIMINATED and excluded).
    // Canonical order:
    // 1. Debjani Modak, 2. Auto Ram Prasad, 3. Jabardasth Naresh, 4. Thrigun,
    // 5. Mukesh Gowda, 6. Varshini Sounderajan, 7. Temper Vamsi, 8. Krishnudu,
    // 9. Sudheer Kumar Reddy, 10. Chaitra Rai, 11. Rohit Naidu, 12. Aman,
    // 13. Shalini, 14. Srushti Vyakaranam, 15. Singer Jhansi
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
      "c-09", // Sudheer Kumar Reddy
      "c-10", // Chaitra Rai
      "c-11", // Rohit Naidu
      "c-12", // Aman
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
        text: `Save ${c.name} (${c.team} TEAM)`,
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
      description: "15 active housemates are currently nominated! Cast your verified fan vote to save your favorite housemate (1 vote per day).",
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
        title: "CHARAN ELIMINATED FROM BIGG BOSS BASED ON HOUSEMATES' VOTES",
        slug: "charan-eliminated-from-bigg-boss-based-on-housemates-votes",
        summary: "Charan has been officially eliminated from Bigg Boss Telugu Season 10 following housemates' votes, leaving 15 active housemates in the competition.",
        content: `In the first eviction of Bigg Boss Telugu Season 10, Charan has been eliminated from the house based on housemates' votes.

With Charan's exit, 15 active contestants remain in the competition. The official voting poll has been updated to reflect the 15 active nominated housemates, and voting is open with 1 vote per user per day.`,
        category: "Evictions",
        imageUrl: "/images/contestants/charan.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
      {
        id: "news-02",
        title: "RED TEAM WINS TASK 1: ROHIT NAIDU AND TEMPER VAMSI SECURE VICTORY",
        slug: "red-team-wins-task-1-rohit-naidu-and-temper-vamsi-secure-victory",
        summary: "Red Team takes the victory in Task 1 as Rohit Naidu and Temper Vamsi outperform Blue Team's Thrigun and Mukesh Gowda in an intense arena battle.",
        content: `Red Team has clinched victory in the first official task of Bigg Boss Telugu Season 10.

Representing Red Team, Leader Rohit Naidu and Temper Vamsi delivered a dominant performance to secure the win. Blue Team participants Thrigun and Mukesh Gowda fought hard but took the loss. Red Team celebrates a crucial victory as Week 1 continues.`,
        category: "Tasks",
        imageUrl: "/images/contestants/rohit-naidu.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
      },
      {
        id: "news-03",
        title: "AUTO RAM PRASAD AND CHAITRA RAI ENTER HIGH RISK ZONE",
        slug: "auto-ram-prasad-and-chaitra-rai-enter-high-risk-zone",
        summary: "Auto Ram Prasad (Blue Team) and Chaitra Rai (Red Team) are the only two contestants currently in the High Risk Zone. Both remain active, nominated housemates.",
        content: `The Bigg Boss Telugu Season 10 danger zone is set: Auto Ram Prasad from Blue Team and Chaitra Rai from Red Team have entered the High Risk Zone.

Exactly two contestants currently occupy the High Risk Zone. Bigg Boss Telugu Fans clarifies that High Risk Zone does NOT mean elimination; both Auto Ram Prasad and Chaitra Rai are active, nominated housemates eligible for public votes in the save poll. Charan, Aman, and Mukesh Gowda are NOT in the High Risk Zone.`,
        category: "Nominations",
        imageUrl: "/images/contestants/auto-ram-prasad.webp",
        viewsCount: 0,
        isTrending: true,
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
      },
      {
        id: "news-04",
        title: "DEBJANI MODAK AND ROHIT NAIDU LEAD BLUE AND RED TEAMS",
        slug: "debjani-modak-and-rohit-naidu-lead-blue-and-red-teams",
        summary: "Debjani Modak commands Blue Team while Rohit Naidu leads Red Team as 15 active contestants face Week 1 public voting.",
        content: `With Week 1 dynamics heating up, Debjani Modak stands firm as Blue Team Leader and Rohit Naidu as Red Team Leader.

Fans can support their favorites through the verified fan voting system, with exactly 1 vote per user per day allowed.`,
        category: "Leadership",
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
      title: "Red Team Task 1 Victory: How will Blue Team bounce back?",
      description: "With Rohit Naidu and Temper Vamsi securing victory in Task 1 over Thrigun and Mukesh Gowda, how will Debjani Modak rally the Blue Team? Also, what are your thoughts on Charan's elimination and Auto Ram Prasad & Chaitra Rai in the High Risk Zone?",
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
      title: "15 Active Contestants Nominated: Cast your 1 vote per day to save your favorite!",
      description: "With Charan eliminated, 15 housemates are on the voting block. Who are you supporting today? Remember: 1 vote per user per day!",
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

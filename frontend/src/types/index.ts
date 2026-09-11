export type ContestantTeam = "RED" | "BLUE";
export type ContestantStatus = "ACTIVE" | "NOMINATED" | "EVICTED" | "ELIMINATED" | "CAPTAIN";
export type ContestantRole = "CAPTAIN" | "PLAYER" | "LEADER";
export type ContestantZone = "HIGH_RISK" | "NORMAL" | "HIGH";
export type TaskStatus = "IN_TASK" | "OUT_OF_FIRST_TASK" | "COMPLETED" | "HIGH_ZONE";

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
  role?: ContestantRole;
  isActive?: boolean;
  isNominated?: boolean;
  zone?: ContestantZone;
  isHighRiskZone?: boolean;
  isHighZone?: boolean;
  isHousemate?: boolean;
  isTaskWinner?: boolean;
  taskTitle?: string;
  taskStatus?: TaskStatus;
  isEliminated?: boolean;
  eliminatedAt?: string;
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
  createdAt: string;
}

export interface PollOption {
  id: string;
  pollId?: string;
  contestantId?: string;
  text: string;
  imageUrl?: string;
  votesCount: number;
  percentage?: number;
  team?: "RED" | "BLUE";
  zone?: ContestantZone;
  isHighRiskZone?: boolean;
  isHighZone?: boolean;
  taskStatus?: string;
}

export interface Poll {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "DRAFT" | "SCHEDULED" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  totalVotes: number;
  options: PollOption[];
  startsAt: string;
  endsAt?: string;
  createdAt: string;
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
  publishedAt: string;
  createdAt: string;
}

export interface Meme {
  id: string;
  userId: string;
  username: string;
  title: string;
  imageUrl: string;
  likesCount: number;
  isApproved: boolean;
  createdAt: string;
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
  createdAt: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  username: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  stats?: {
    postsCount: number;
    commentsCount: number;
    votesCount: number;
    badges: string[];
  };
}

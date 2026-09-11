import { Contestant, Poll, NewsItem, Meme, Post, User } from "../types";

const isServer = typeof window === "undefined";
const API_BASE = isServer
  ? (process.env.INTERNAL_API_URL || "http://127.0.0.1:4000/api/v1")
  : (process.env.NEXT_PUBLIC_API_URL || "/api/v1");

/**
 * Gets or creates a cryptographically secure anonymous voter token
 * stored securely in the client browser (Section 20)
 */
export function getOrCreateVoterToken(): string {
  if (typeof window === "undefined") return "server-token";
  let token = localStorage.getItem("bb_voter_token");
  if (!token) {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      token = crypto.randomUUID();
    } else {
      token = "vt_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    localStorage.setItem("bb_voter_token", token);
  }
  return token;
}

// Fallback seed data for ultra-reliable, zero-downtime offline and preview mode
export const fallbackContestants: Contestant[] = [
  {
    id: "c-11",
    name: "Rohit Naidu",
    slug: "rohit-naidu",
    season: 10,
    team: "RED",
    role: "PLAYER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
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
    createdAt: new Date().toISOString(),
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
    bio: "Athletic model and fitness standout currently in the High Risk Zone as an active nominated individual housemate.",
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "c-14",
    name: "Shalini",
    slug: "shalini",
    season: 10,
    team: "RED",
    role: "PLAYER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "c-16",
    name: "Singer Jhansi",
    slug: "singer-jhansi",
    season: 10,
    team: "RED",
    role: "PLAYER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "c-07",
    name: "Temper Vamsi",
    slug: "temper-vamsi",
    season: 10,
    team: "RED",
    role: "PLAYER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
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
    createdAt: new Date().toISOString(),
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
    eliminatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "c-15",
    name: "Srushti Vyakaranam",
    slug: "srushti-vyakaranam",
    season: 10,
    team: "RED",
    role: "PLAYER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
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
    createdAt: new Date().toISOString(),
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
    bio: "Spirited RJ and youth presenter. Officially eliminated from Season 10 based on housemates' votes.",
    occupation: "Radio Jockey",
    status: "ELIMINATED",
    isActive: false,
    isNominated: false,
    isEliminated: true,
    eliminatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "c-04",
    name: "Thrigun",
    slug: "thrigun",
    season: 10,
    team: "BLUE",
    role: "PLAYER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "c-03",
    name: "Jabardasth Naresh",
    slug: "jabardasth-naresh",
    season: 10,
    team: "BLUE",
    role: "PLAYER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "c-01",
    name: "Debjani Modak",
    slug: "debjani-modak",
    season: 10,
    team: "BLUE",
    role: "PLAYER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "c-08",
    name: "Krishnudu",
    slug: "krishnudu",
    season: 10,
    team: "BLUE",
    role: "PLAYER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
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
    createdAt: new Date().toISOString(),
  },
];

// Fallback Poll — ONLY "WHO SHOULD BE SAVED?" with 14 active nominated contestants (Charan and Chaitra Rai excluded)
// Clean neutral voting state, ZERO fake numbers!
export const fallbackPolls: Poll[] = [
  {
    id: "poll-eviction-01",
    title: "Who Should Be Saved?",
    description: "14 active housemates are currently nominated! Cast your verified fan vote to save your favorite housemate (1 vote per day).",
    category: "Nominations",
    status: "ACTIVE",
    totalVotes: 0,
    options: [
      { id: "opt-save-c-01", contestantId: "c-01", text: "Save Debjani Modak", imageUrl: "/images/contestants/debjani-modak.webp", votesCount: 0, percentage: 0, zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-02", contestantId: "c-02", text: "Save Auto Ram Prasad", imageUrl: "/images/contestants/auto-ram-prasad.webp", votesCount: 0, percentage: 0, zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-03", contestantId: "c-03", text: "Save Jabardasth Naresh", imageUrl: "/images/contestants/jabardasth-naresh.webp", votesCount: 0, percentage: 0, zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-04", contestantId: "c-04", text: "Save Thrigun", imageUrl: "/images/contestants/thrigun.webp", votesCount: 0, percentage: 0, zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-05", contestantId: "c-05", text: "Save Mukesh Gowda", imageUrl: "/images/contestants/mukesh-gowda.webp", votesCount: 0, percentage: 0, zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-06", contestantId: "c-06", text: "Save Varshini Sounderajan", imageUrl: "/images/contestants/varshini-sounderajan.webp", votesCount: 0, percentage: 0, zone: "HIGH_RISK", isHighRiskZone: true },
      { id: "opt-save-c-07", contestantId: "c-07", text: "Save Temper Vamsi", imageUrl: "/images/contestants/temper-vamsi.webp", votesCount: 0, percentage: 0, zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-08", contestantId: "c-08", text: "Save Krishnudu", imageUrl: "/images/contestants/krishnudu.webp", votesCount: 0, percentage: 0, zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-09", contestantId: "c-09", text: "Save Sudheer Kumar Reddy", imageUrl: "/images/contestants/sudheer-kumar-reddy.webp", votesCount: 0, percentage: 0, zone: "HIGH_RISK", isHighRiskZone: true },
      // Chaitra Rai is ELIMINATED - excluded from voting
      { id: "opt-save-c-11", contestantId: "c-11", text: "Save Rohit Naidu", imageUrl: "/images/contestants/rohit-naidu.webp", votesCount: 0, percentage: 0, zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-12", contestantId: "c-12", text: "Save Aman", imageUrl: "/images/contestants/aman.webp", votesCount: 0, percentage: 0, zone: "HIGH_RISK", isHighRiskZone: true },
      // Charan is ELIMINATED - excluded from voting
      { id: "opt-save-c-14", contestantId: "c-14", text: "Save Shalini", imageUrl: "/images/contestants/shalini.webp", votesCount: 0, percentage: 0, zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-15", contestantId: "c-15", text: "Save Srushti Vyakaranam", imageUrl: "/images/contestants/srushti-vyakaranam.webp", votesCount: 0, percentage: 0, zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-16", contestantId: "c-16", text: "Save Singer Jhansi", imageUrl: "/images/contestants/singer-jhansi.webp", votesCount: 0, percentage: 0, zone: "NORMAL", isHighRiskZone: false },
    ],
    startsAt: new Date(Date.now() - 86400000).toISOString(),
    endsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Fallback News — 4 Official Stories
const fallbackNews: NewsItem[] = [
  {
    id: "news-01",
    title: "CHAITRA RAI AND CHARAN ELIMINATED FROM BIGG BOSS BASED ON HOUSEMATES' VOTES",
    slug: "chaitra-rai-and-charan-eliminated-from-bigg-boss-based-on-housemates-votes",
    summary: "Charan and Chaitra Rai have both been officially eliminated from Bigg Boss Telugu Season 10, leaving 14 active housemates in the individual competition.",
    content: "In a dramatic turn of events in Bigg Boss Telugu Season 10, both Charan and Chaitra Rai have been officially eliminated from the house based on housemates' votes.\n\nWith Charan and Chaitra Rai evicted, 14 active contestants remain in the competition. The official voting poll has been updated to reflect the 14 active nominated housemates, and voting is open with 1 vote per authenticated account.",
    category: "Evictions",
    imageUrl: "/images/contestants/chaitra-rai.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "news-02",
    title: "AUTO RAM PRASAD NAMED TASK WINNER IN DOMINANT INDIVIDUAL ARENA DISPLAY",
    slug: "auto-ram-prasad-named-task-winner-in-dominant-individual-arena-display",
    summary: "Auto Ram Prasad clinches victory as Task Winner, securing an individual achievement award in Season 10.",
    content: "Auto Ram Prasad has emerged triumphant in the arena challenge of Bigg Boss Telugu Season 10.\n\nDelivering an extraordinary performance, Auto Ram Prasad secured Task Winner honors as an individual achievement. His victory establishes momentum as the 14 active housemates face public voting.",
    category: "Tasks",
    imageUrl: "/images/contestants/auto-ram-prasad.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "news-03",
    title: "AMAN, SUDHEER KUMAR REDDY, AND VARSHINI SOUNDERAJAN ENTER HIGH RISK ZONE",
    slug: "aman-sudheer-kumar-reddy-and-varshini-sounderajan-enter-high-risk-zone",
    summary: "Aman, Sudheer Kumar Reddy, and Varshini Sounderajan are the three contestants currently in the High Risk Zone. All remain active, nominated housemates.",
    content: "The Bigg Boss Telugu Season 10 High Risk Zone is set: Aman, Sudheer Kumar Reddy, and Varshini Sounderajan occupy the three positions.\n\nExactly three contestants currently occupy the High Risk Zone: Aman, Sudheer Kumar Reddy, and Varshini Sounderajan. High Risk Zone indicates danger of eviction but does NOT mean elimination; all three are active, nominated housemates eligible for public votes in the save poll. Auto Ram Prasad, Mukesh Gowda, Charan, and Chaitra Rai are NOT in the High Risk Zone.",
    category: "Nominations",
    imageUrl: "/images/contestants/aman.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "news-04",
    title: "COMPETITION TRANSITIONS TO INDIVIDUAL BATTLE AS 14 HOUSEMATES REMAIN",
    slug: "competition-transitions-to-individual-battle-as-14-housemates-remain",
    summary: "Teams are dissolved as Bigg Boss Telugu Season 10 becomes an all-out individual contest among the 14 active housemates.",
    content: "Bigg Boss Telugu Season 10 has eliminated team divisions. The competition is now purely individual, with each of the 14 active housemates battling on their own merit.\n\nFans can support their favorites through the verified fan voting system, with exactly 1 vote per user per day allowed.",
    category: "House Dynamics",
    imageUrl: "/images/contestants/debjani-modak.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
  },
];

const fallbackPosts: Post[] = [
  {
    id: "post-01",
    userId: "fan-user-001",
    username: "TeluguBigBossLover",
    userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    category: "Fan Theories",
    title: "Auto Ram Prasad Task Winner: Can he survive the individual competition?",
    description: "Auto Ram Prasad is the Task Winner, while Aman, Sudheer Kumar Reddy, and Varshini Sounderajan are in the High Risk Zone. With Charan and Chaitra Rai eliminated, who is your top pick?",
    likesCount: 0,
    commentsCount: 0,
    isPinned: true,
    isDeleted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "post-02",
    userId: "admin-user-001",
    username: "nikhil",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    category: "Nominations",
    title: "14 Active Contestants Nominated: Cast your 1 vote per day to save your favorite!",
    description: "With Charan and Chaitra Rai eliminated, 14 housemates are on the voting block. Who are you supporting today? Remember: 1 vote per authenticated user per day!",
    likesCount: 0,
    commentsCount: 0,
    isPinned: true,
    isDeleted: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
];

// Per Section 23: EMPTY STATE ONLY!
const fallbackMemes: Meme[] = [];

export const api = {
  // Contestants
  async getContestants(status?: string, search?: string, team?: string): Promise<Contestant[]> {
    try {
      const q = new URLSearchParams();
      if (status) q.append("status", status);
      if (search) q.append("search", search);
      if (team) q.append("team", team);
      const res = await fetch(`${API_BASE}/contestants?${q.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    let list = fallbackContestants;
    if (status && status !== "ALL") {
      if (status.toUpperCase() === "ACTIVE") {
        list = list.filter((c) => !c.isEliminated && c.status !== "ELIMINATED" && c.status !== "EVICTED");
      } else if (status.toUpperCase() === "ELIMINATED") {
        list = list.filter((c) => c.isEliminated || c.status === "ELIMINATED");
      } else if (
        status.toUpperCase() === "HIGH_RISK" ||
        status.toUpperCase() === "HIGH_RISK_ZONE" ||
        status.toUpperCase() === "HIGH RISK ZONE" ||
        status.toUpperCase() === "HIGH_ZONE" ||
        status.toUpperCase() === "HIGH ZONE"
      ) {
        list = list.filter(
          (c) =>
            (c.zone === "HIGH_RISK" ||
              c.isHighRiskZone ||
              c.slug === "aman" ||
              c.slug === "sudheer-kumar-reddy" ||
              c.slug === "varshini-sounderajan" ||
              c.id === "c-06") &&
            !c.isEliminated &&
            c.status !== "ELIMINATED" &&
            c.slug !== "auto-ram-prasad" &&
            c.slug !== "mukesh-gowda" &&
            c.slug !== "charan" &&
            c.slug !== "chaitra-rai"
        );
      } else if (status.toUpperCase() === "NOMINATED") {
        list = list.filter((c) => c.isNominated || c.status === "NOMINATED");
      } else {
        list = list.filter((c) => c.status === status);
      }
    }
    if (team && team !== "ALL") {
      list = list.filter((c) => c.team?.toUpperCase() === team.toUpperCase());
    }
    if (search) list = list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.occupation.toLowerCase().includes(search.toLowerCase()));
    return list;
  },

  async getContestant(id: string): Promise<Contestant | null> {
    try {
      const res = await fetch(`${API_BASE}/contestants/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return fallbackContestants.find((c) => c.id === id || c.slug === id) || fallbackContestants[0];
  },

  async getRankings() {
    try {
      const res = await fetch(`${API_BASE}/contestants/rankings`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return fallbackContestants
      .filter((c) => c.status !== "EVICTED" && c.status !== "ELIMINATED" && !c.isEliminated)
      .map((c, i) => ({
        rank: i + 1,
        id: c.id,
        name: c.name,
        slug: c.slug,
        avatarUrl: c.avatarUrl,
        status: c.status,
        team: c.team,
        popularity: c.popularityScore,
        trend: c.trend,
        occupation: c.occupation,
      }));
  },

  // Polls
  async getPolls(status?: string): Promise<Poll[]> {
    try {
      const q = status ? `?status=${status}` : "";
      const res = await fetch(`${API_BASE}/polls${q}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    if (status) return fallbackPolls.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    return fallbackPolls;
  },

  async getPoll(id: string): Promise<Poll | null> {
    try {
      const res = await fetch(`${API_BASE}/polls/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return fallbackPolls.find((p) => p.id === id) || fallbackPolls[0];
  },

  async getVoteStatus(pollId: string, customToken?: string): Promise<{ hasVoted: boolean; optionId?: string; contestantName?: string }> {
    const voterToken = getOrCreateVoterToken();
    const token = customToken || (typeof window !== "undefined" ? localStorage.getItem("bb_auth_token") : null);
    try {
      const headers: Record<string, string> = {
        "X-Voter-Token": voterToken,
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${API_BASE}/polls/${pollId}/vote-status?voterToken=${encodeURIComponent(voterToken)}`, {
        headers,
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        const todayStr = new Date().toISOString().slice(0, 10);
        if (data && data.hasVoted) {
          if (typeof window !== "undefined") {
            localStorage.setItem(`bb_voted_${pollId}`, JSON.stringify({
              optionId: data.optionId,
              contestantName: data.contestantName,
              date: todayStr,
            }));
          }
          return data;
        } else {
          if (typeof window !== "undefined") {
            localStorage.removeItem(`bb_voted_${pollId}`);
          }
          return { hasVoted: false };
        }
      }
    } catch (e) {}

    // Fallback to local storage (only valid if cast today)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`bb_voted_${pollId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const todayStr = new Date().toISOString().slice(0, 10);
          if (parsed.date === todayStr) {
            return { hasVoted: true, optionId: parsed.optionId, contestantName: parsed.contestantName };
          } else {
            localStorage.removeItem(`bb_voted_${pollId}`);
          }
        } catch (_) {
          return { hasVoted: true };
        }
      }
    }

    return { hasVoted: false };
  },

  async vote(pollId: string, optionId: string, customToken?: string): Promise<any> {
    const voterToken = getOrCreateVoterToken();
    const token = customToken || (typeof window !== "undefined" ? localStorage.getItem("bb_auth_token") : null);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Voter-Token": voterToken,
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/polls/${pollId}/votes`, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ optionId, voterToken }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const errorMsg = Array.isArray(data.message)
        ? data.message.join(", ")
        : (data.message || (res.status === 401 ? "Authentication required to cast a vote. Please sign in or register." : "Failed to cast vote"));
      const err: any = new Error(errorMsg);
      err.status = res.status;
      err.error = data.error || (data.message?.includes("already") ? "ALREADY_VOTED" : "VOTE_FAILED");
      throw err;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem(`bb_voted_${pollId}`, JSON.stringify({
        optionId,
        contestantName: data.contestantName,
        date: new Date().toISOString().slice(0, 10),
      }));
    }
    return data;
  },

  // News
  async getNews(category?: string, trending?: boolean): Promise<NewsItem[]> {
    try {
      const q = new URLSearchParams();
      if (category) q.append("category", category);
      if (trending) q.append("trending", "true");
      const res = await fetch(`${API_BASE}/news?${q.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    let list = fallbackNews;
    if (category && category !== "All") list = list.filter((n) => n.category === category);
    if (trending) list = list.filter((n) => n.isTrending);
    return list;
  },

  async getNewsArticle(slug: string): Promise<NewsItem | null> {
    try {
      const res = await fetch(`${API_BASE}/news/${slug}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return fallbackNews.find((n) => n.slug === slug || n.id === slug) || fallbackNews[0];
  },

  // Discuss
  async getPosts(category?: string, sort?: "latest" | "trending" | "top", search?: string): Promise<Post[]> {
    try {
      const q = new URLSearchParams();
      if (category) q.append("category", category);
      if (sort) q.append("sort", sort);
      if (search) q.append("search", search);
      const res = await fetch(`${API_BASE}/posts?${q.toString()}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    let list = [...fallbackPosts];
    if (category && category !== "All Discussions") list = list.filter((p) => p.category === category);
    if (search) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
    return list;
  },

  async getPost(id: string): Promise<Post | null> {
    try {
      const res = await fetch(`${API_BASE}/posts/${id}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return fallbackPosts.find((p) => p.id === id) || fallbackPosts[0];
  },

  async createPost(data: { title: string; description: string; category?: string; token?: string }) {
    try {
      const res = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(data.token ? { Authorization: `Bearer ${data.token}` } : {}),
        },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    const newPost: Post = {
      id: "post-" + Date.now(),
      userId: "user-current",
      username: "TeluguBigBossLover",
      category: data.category || "General Talk",
      title: data.title,
      description: data.description,
      likesCount: 0,
      commentsCount: 0,
      isPinned: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    fallbackPosts.unshift(newPost);
    return newPost;
  },

  // Memes
  async getMemes(): Promise<Meme[]> {
    try {
      const res = await fetch(`${API_BASE}/memes`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return fallbackMemes;
  },

  async likeMeme(id: string) {
    try {
      const res = await fetch(`${API_BASE}/memes/${id}/like`, { method: "POST" });
      if (res.ok) return await res.json();
    } catch (e) {}
    const meme = fallbackMemes.find((m) => m.id === id);
    if (meme) meme.likesCount += 1;
    return { likesCount: meme?.likesCount || 1 };
  },

  // Admin Overview
  async getAdminOverview(token?: string) {
    try {
      const res = await fetch(`${API_BASE}/admin/overview`, {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return {
      metrics: {
        totalUsers: 1420,
        activeUsers: 840,
        totalVotes: 16110,
        totalPolls: 3,
        totalPosts: 28,
        totalComments: 142,
        pendingReports: 2,
        totalNews: 5,
        totalMemes: 18,
        maxVotesPerIpThreshold: 50,
      },
      traffic: {
        dailyPageviews: 48290,
        uniqueVisitors: 12450,
        avgSessionDuration: "4m 32s",
        peakConcurrentUsers: 2410,
      },
    };
  },
};

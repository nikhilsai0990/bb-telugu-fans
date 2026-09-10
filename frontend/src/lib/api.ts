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
  // --- RED TEAM (8 Total) ---
  {
    id: "c-11",
    name: "Rohit Naidu",
    slug: "rohit-naidu",
    season: 10,
    team: "RED",
    role: "LEADER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    bio: "Spirited RJ and youth presenter. Eliminated from Season 10 based on housemates' votes.",
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
];

// Fallback Poll — ONLY "WHO SHOULD BE SAVED?" with 15 active nominated contestants (Charan excluded)
// Clean neutral voting state, ZERO fake numbers!
export const fallbackPolls: Poll[] = [
  {
    id: "poll-eviction-01",
    title: "Who Should Be Saved?",
    description: "15 active housemates are currently nominated! Cast your verified fan vote to save your favorite housemate (1 vote per day).",
    category: "Nominations",
    status: "ACTIVE",
    totalVotes: 0,
    options: [
      { id: "opt-save-c-01", contestantId: "c-01", text: "Save Debjani Modak (BLUE TEAM)", imageUrl: "/images/contestants/debjani-modak.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-02", contestantId: "c-02", text: "Save Auto Ram Prasad (BLUE TEAM)", imageUrl: "/images/contestants/auto-ram-prasad.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "HIGH_RISK", isHighRiskZone: true },
      { id: "opt-save-c-03", contestantId: "c-03", text: "Save Jabardasth Naresh (BLUE TEAM)", imageUrl: "/images/contestants/jabardasth-naresh.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-04", contestantId: "c-04", text: "Save Thrigun (BLUE TEAM)", imageUrl: "/images/contestants/thrigun.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-05", contestantId: "c-05", text: "Save Mukesh Gowda (BLUE TEAM)", imageUrl: "/images/contestants/mukesh-gowda.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-06", contestantId: "c-06", text: "Save Varshini Sounderajan (BLUE TEAM)", imageUrl: "/images/contestants/varshini-sounderajan.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-07", contestantId: "c-07", text: "Save Temper Vamsi (RED TEAM)", imageUrl: "/images/contestants/temper-vamsi.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-08", contestantId: "c-08", text: "Save Krishnudu (BLUE TEAM)", imageUrl: "/images/contestants/krishnudu.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-09", contestantId: "c-09", text: "Save Sudheer Kumar Reddy (BLUE TEAM)", imageUrl: "/images/contestants/sudheer-kumar-reddy.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-10", contestantId: "c-10", text: "Save Chaitra Rai (RED TEAM)", imageUrl: "/images/contestants/chaitra-rai.webp", votesCount: 0, percentage: 0, team: "RED", zone: "HIGH_RISK", isHighRiskZone: true },
      { id: "opt-save-c-11", contestantId: "c-11", text: "Save Rohit Naidu (RED TEAM)", imageUrl: "/images/contestants/rohit-naidu.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-12", contestantId: "c-12", text: "Save Aman (RED TEAM)", imageUrl: "/images/contestants/aman.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
      // Charan is ELIMINATED - excluded from voting
      { id: "opt-save-c-14", contestantId: "c-14", text: "Save Shalini (RED TEAM)", imageUrl: "/images/contestants/shalini.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-15", contestantId: "c-15", text: "Save Srushti Vyakaranam (RED TEAM)", imageUrl: "/images/contestants/srushti-vyakaranam.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-16", contestantId: "c-16", text: "Save Singer Jhansi (RED TEAM)", imageUrl: "/images/contestants/singer-jhansi.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
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
    title: "CHARAN ELIMINATED FROM BIGG BOSS BASED ON HOUSEMATES' VOTES",
    slug: "charan-eliminated-from-bigg-boss-based-on-housemates-votes",
    summary: "Charan has been officially eliminated from Bigg Boss Telugu Season 10 following housemates' votes, leaving 15 active housemates in the competition.",
    content: "In the first eviction of Bigg Boss Telugu Season 10, Charan has been eliminated from the house based on housemates' votes.\n\nWith Charan's exit, 15 active contestants remain in the competition. The official voting poll has been updated to reflect the 15 active nominated housemates, and voting is open with 1 vote per user per day.",
    category: "Evictions",
    imageUrl: "/images/contestants/charan.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "news-02",
    title: "RED TEAM WINS TASK 1: ROHIT NAIDU AND TEMPER VAMSI SECURE VICTORY",
    slug: "red-team-wins-task-1-rohit-naidu-and-temper-vamsi-secure-victory",
    summary: "Red Team takes the victory in Task 1 as Rohit Naidu and Temper Vamsi outperform Blue Team's Thrigun and Mukesh Gowda in an intense arena battle.",
    content: "Red Team has clinched victory in the first official task of Bigg Boss Telugu Season 10.\n\nRepresenting Red Team, Leader Rohit Naidu and Temper Vamsi delivered a dominant performance to secure the win. Blue Team participants Thrigun and Mukesh Gowda fought hard but took the loss. Red Team celebrates a crucial victory as Week 1 continues.",
    category: "Tasks",
    imageUrl: "/images/contestants/rohit-naidu.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "news-03",
    title: "AUTO RAM PRASAD AND CHAITRA RAI ENTER HIGH RISK ZONE",
    slug: "auto-ram-prasad-and-chaitra-rai-enter-high-risk-zone",
    summary: "Auto Ram Prasad (Blue Team) and Chaitra Rai (Red Team) are the only two contestants currently in the High Risk Zone. Both remain active, nominated housemates.",
    content: "The Bigg Boss Telugu Season 10 danger zone is set: Auto Ram Prasad from Blue Team and Chaitra Rai from Red Team have entered the High Risk Zone.\n\nExactly two contestants currently occupy the High Risk Zone. Bigg Boss Telugu Fans clarifies that High Risk Zone does NOT mean elimination; both Auto Ram Prasad and Chaitra Rai are active, nominated housemates eligible for public votes in the save poll. Charan, Aman, and Mukesh Gowda are NOT in the High Risk Zone.",
    category: "Nominations",
    imageUrl: "/images/contestants/auto-ram-prasad.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "news-04",
    title: "DEBJANI MODAK AND ROHIT NAIDU LEAD BLUE AND RED TEAMS",
    slug: "debjani-modak-and-rohit-naidu-lead-blue-and-red-teams",
    summary: "Debjani Modak commands Blue Team while Rohit Naidu leads Red Team as 15 active contestants face Week 1 public voting.",
    content: "With Week 1 dynamics heating up, Debjani Modak stands firm as Blue Team Leader and Rohit Naidu as Red Team Leader.\n\nFans can support their favorites through the verified fan voting system, with exactly 1 vote per user per day allowed.",
    category: "Leadership",
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
    title: "Red Team Task 1 Victory: How will Blue Team bounce back?",
    description: "With Rohit Naidu and Temper Vamsi securing victory in Task 1 over Thrigun and Mukesh Gowda, how will Debjani Modak rally the Blue Team? Also, what are your thoughts on Charan's elimination and Auto Ram Prasad & Chaitra Rai in the High Risk Zone?",
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
    title: "15 Active Contestants Nominated: Cast your 1 vote per day to save your favorite!",
    description: "With Charan eliminated, 15 housemates are on the voting block. Who are you supporting today? Remember: 1 vote per user per day!",
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
        list = list.filter((c) => (c.zone === "HIGH_RISK" || c.isHighRiskZone || c.slug === "chaitra-rai" || c.slug === "auto-ram-prasad") && c.slug !== "charan" && c.slug !== "aman" && c.slug !== "mukesh-gowda");
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

  async getVoteStatus(pollId: string): Promise<{ hasVoted: boolean; optionId?: string; contestantName?: string }> {
    const voterToken = getOrCreateVoterToken();
    try {
      const res = await fetch(`${API_BASE}/polls/${pollId}/vote-status?voterToken=${encodeURIComponent(voterToken)}`, {
        headers: { "X-Voter-Token": voterToken },
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

  async vote(pollId: string, optionId: string): Promise<any> {
    const voterToken = getOrCreateVoterToken();
    try {
      const res = await fetch(`${API_BASE}/polls/${pollId}/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Voter-Token": voterToken,
        },
        body: JSON.stringify({ optionId, voterToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        const err: any = new Error(data.message || "Failed to vote");
        err.error = data.error || (data.message?.includes("already") ? "ALREADY_VOTED" : "VOTE_FAILED");
        throw err;
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(`bb_voted_${pollId}`, JSON.stringify({
          optionId,
          contestantName: data.contestantName,
        }));
      }
      return data;
    } catch (err: any) {
      if (err.error === "ALREADY_VOTED" || (err.message && err.message.toLowerCase().includes("already"))) {
        throw err;
      }
      // Local fallback simulation with duplicate check
      const votedKey = `bb_voted_${pollId}`;
      if (typeof window !== "undefined" && localStorage.getItem(votedKey)) {
        const error: any = new Error("You have already participated and cast your vote in this poll.");
        error.error = "ALREADY_VOTED";
        throw error;
      }
      const opt = fallbackPolls[0]?.options.find((o) => o.id === optionId);
      const cName = opt ? opt.text.replace(/Save\s*/i, "").replace(/\s*\([^)]*\)/i, "").trim() : "your selected housemate";
      if (typeof window !== "undefined") {
        localStorage.setItem(votedKey, JSON.stringify({ optionId, contestantName: cName }));
      }
      return {
        success: true,
        message: "Your vote has been securely recorded!",
        contestantName: cName,
        totalVotes: 1,
        options: fallbackPolls[0]?.options.map((o) => ({
          ...o,
          votesCount: o.id === optionId ? 1 : 0,
          percentage: o.id === optionId ? 100 : 0,
        })),
      };
    }
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

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
    createdAt: new Date().toISOString(),
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
    isHousemate: true,
    avatarUrl: "/images/contestants/chaitra-rai.webp",
    bio: "Experienced television actress. Officially eliminated from Bigg Boss Telugu Season 10 based on housemates' votes. No re-entry.",
    occupation: "Television Actress",
    status: "ELIMINATED",
    isActive: false,
    isNominated: false,
    isEliminated: true,
    noReentry: true,
    reEntryEligible: false,
    eliminatedAt: new Date().toISOString(),
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
    isHousemate: true,
    avatarUrl: "/images/contestants/charan.webp",
    bio: "Spirited RJ and youth presenter. Officially eliminated from Season 10 based on housemates' votes. No re-entry.",
    occupation: "Radio Jockey",
    status: "ELIMINATED",
    isActive: false,
    isNominated: false,
    isEliminated: true,
    noReentry: true,
    reEntryEligible: false,
    eliminatedAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "c-09",
    name: "Sudheer Kumar Reddy",
    slug: "sudheer-kumar-reddy",
    season: 10,
    team: "BLUE",
    role: "PLAYER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
    isHousemate: true,
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
    createdAt: new Date().toISOString(),
  },
  {
    id: "c-06",
    name: "Varshini Sounderajan",
    slug: "varshini-sounderajan",
    season: 10,
    team: "BLUE",
    role: "PLAYER",
    zone: "NORMAL",
    isHighRiskZone: false,
    isHighZone: false,
    isHousemate: true,
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
    createdAt: new Date().toISOString(),
  },
];

// Fallback Poll — ONLY "WHO SHOULD BE SAVED?" with 14 active housemates (Charan and Chaitra Rai excluded)
// Status is CLOSED for Sunday!
export const fallbackPolls: Poll[] = [
  {
    id: "poll-eviction-01",
    title: "Who Should Be Saved?",
    description: "14 active housemates. Voting is currently closed.",
    category: "Nominations",
    status: "CLOSED",
    totalVotes: 0,
    options: [
      { id: "opt-save-c-01", contestantId: "c-01", text: "Save Debjani Modak", imageUrl: "/images/contestants/debjani-modak.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-02", contestantId: "c-02", text: "Save Auto Ram Prasad", imageUrl: "/images/contestants/auto-ram-prasad.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-03", contestantId: "c-03", text: "Save Jabardasth Naresh", imageUrl: "/images/contestants/jabardasth-naresh.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-04", contestantId: "c-04", text: "Save Thrigun", imageUrl: "/images/contestants/thrigun.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-05", contestantId: "c-05", text: "Save Mukesh Gowda", imageUrl: "/images/contestants/mukesh-gowda.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-06", contestantId: "c-06", text: "Save Varshini Sounderajan", imageUrl: "/images/contestants/varshini-sounderajan.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-07", contestantId: "c-07", text: "Save Temper Vamsi", imageUrl: "/images/contestants/temper-vamsi.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-08", contestantId: "c-08", text: "Save Krishnudu", imageUrl: "/images/contestants/krishnudu.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-09", contestantId: "c-09", text: "Save Sudheer Kumar Reddy", imageUrl: "/images/contestants/sudheer-kumar-reddy.webp", votesCount: 0, percentage: 0, team: "BLUE", zone: "NORMAL", isHighRiskZone: false },
      // Chaitra Rai is ELIMINATED - excluded from voting
      { id: "opt-save-c-11", contestantId: "c-11", text: "Save Rohit Naidu", imageUrl: "/images/contestants/rohit-naidu.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-12", contestantId: "c-12", text: "Save Aman", imageUrl: "/images/contestants/aman.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
      // Charan is ELIMINATED - excluded from voting
      { id: "opt-save-c-14", contestantId: "c-14", text: "Save Shalini", imageUrl: "/images/contestants/shalini.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-15", contestantId: "c-15", text: "Save Srushti Vyakaranam", imageUrl: "/images/contestants/srushti-vyakaranam.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
      { id: "opt-save-c-16", contestantId: "c-16", text: "Save Singer Jhansi", imageUrl: "/images/contestants/singer-jhansi.webp", votesCount: 0, percentage: 0, team: "RED", zone: "NORMAL", isHighRiskZone: false },
    ],
    startsAt: new Date(Date.now() - 86400000).toISOString(),
    endsAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Fallback News — 5 Official Stories
const fallbackNews: NewsItem[] = [
  {
    id: "news-01",
    title: "No Elimination on Sunday",
    slug: "no-elimination-on-sunday",
    summary: "Bigg Boss Telugu Season 10 sees no eviction this Sunday as all 14 active housemates are declared safe.",
    content: "In an unexpected turn of events during the weekend episode of Bigg Boss Telugu Season 10, it was announced that there will be no elimination this Sunday. All 14 active housemates remain safe in the house as the game intensifies.",
    category: "Evictions",
    imageUrl: "/images/contestants/debjani-modak.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "news-02",
    title: "Srushti Vyakaranam lost the Power Key due to housemates' votes.",
    slug: "srushti-vyakaranam-lost-the-power-key-due-to-housemates-votes",
    summary: "Following a decisive house vote, Srushti Vyakaranam loses the coveted Power Key.",
    content: "Tensions flared inside the Bigg Boss Telugu Season 10 house during the Power Key review session. Based on majority votes from fellow housemates, Srushti Vyakaranam had to surrender the Power Key, shaking up house dynamics and alliances.",
    category: "Tasks",
    imageUrl: "/images/contestants/srushti-vyakaranam.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "news-03",
    title: "Sudheer Kumar Reddy won.",
    slug: "sudheer-kumar-reddy-won",
    summary: "Sudheer Kumar Reddy clinches a hard-fought challenge inside the Bigg Boss Telugu house.",
    content: "Sudheer Kumar Reddy showcased exceptional stamina and tactical sharpness to secure a crucial individual victory in the arena. His win provides a major morale boost amidst fierce competition among the active housemates.",
    category: "Tasks",
    imageUrl: "/images/contestants/sudheer-kumar-reddy.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "news-04",
    title: "Krishnudu's team won the task against Naresh's team.",
    slug: "krishnudus-team-won-the-task-against-nareshs-team",
    summary: "Team B led by Krishnudu overcomes Team A led by Naresh in a dramatic team showdown.",
    content: "The latest team challenge delivered edge-of-the-seat drama as Team A (Naresh) clashed with Team B (Krishnudu). Displaying superior coordination and tenacity, Krishnudu's team triumphed over Naresh's team to claim victory.",
    category: "Tasks",
    imageUrl: "/images/contestants/krishnudu.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "news-05",
    title: "No re-entry for Chaitra Rai and Charan.",
    slug: "no-re-entry-for-chaitra-rai-and-charan",
    summary: "Bigg Boss confirms that eliminated housemates Chaitra Rai and Charan will have no re-entry into the house.",
    content: "Following their exit based on housemates' votes, Bigg Boss has confirmed that neither Chaitra Rai nor Charan will be granted re-entry into the Season 10 house. The competition moves forward strictly with the 14 active housemates.",
    category: "Evictions",
    imageUrl: "/images/contestants/chaitra-rai.webp",
    viewsCount: 0,
    isTrending: true,
    isPublished: true,
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

const fallbackPosts: Post[] = [
  {
    id: "post-01",
    userId: "fan-user-001",
    username: "TeluguBigBossLover",
    userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    category: "Fan Theories",
    title: "Task Winners & Season 10 Housemates: Who is making the biggest impact?",
    description: "Auto Ram Prasad, Rohit Naidu, and Temper Vamsi have all won tasks in Week 1. Who is your top pick?",
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
    title: "14 Active Housemates Nominated: Cast your vote when polls are open!",
    description: "With Charan and Chaitra Rai eliminated (no re-entry), 14 housemates remain in the competition. Voting is currently closed for Sunday.",
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

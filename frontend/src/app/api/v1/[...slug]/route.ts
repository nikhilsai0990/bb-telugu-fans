import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  fallbackContestants,
  fallbackPolls,
  fallbackNews,
  isVotingScheduleOpen,
} from "../../../../lib/api";

const JWT_SECRET = process.env.JWT_SECRET || "bb_super_secret_jwt_key_2026";
const PWD_SALT = "bb_fans_pwd_salt";

// In-process global singleton store for serverless resilience
interface ServerUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "USER" | "MODERATOR" | "ADMIN";
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

interface ServerVote {
  pollId: string;
  optionId: string;
  userId: string;
  date: string; // YYYY-MM-DD
}

const g = global as any;
if (!g.__bb_users) {
  g.__bb_users = new Map<string, ServerUser>();
  // Seed default admin & fan
  const adminPwdHash = crypto.createHmac("sha256", PWD_SALT).update("AdminBBTelugu2026!").digest("hex");
  const fanPwdHash = crypto.createHmac("sha256", PWD_SALT).update("FanPass2026!").digest("hex");

  g.__bb_users.set("admin-user-001", {
    id: "admin-user-001",
    username: "nikhil",
    email: "admin@bbtelugufans.com",
    passwordHash: adminPwdHash,
    role: "ADMIN",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    bio: "Administrator for BB Telugu Fans platform.",
    createdAt: new Date().toISOString(),
  });

  g.__bb_users.set("fan-user-001", {
    id: "fan-user-001",
    username: "TeluguBigBossLover",
    email: "fan@bbtelugufans.com",
    passwordHash: fanPwdHash,
    role: "USER",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    bio: "Die-hard BB Telugu fan since Season 1. Analyzing house dynamics 24/7!",
    createdAt: new Date().toISOString(),
  });
}

if (!g.__bb_votes) {
  g.__bb_votes = [];
}

if (!g.__bb_polls || g.__bb_polls.length === 0) {
  // Deep clone fallbackPolls
  g.__bb_polls = JSON.parse(JSON.stringify(fallbackPolls));
} else {
  // Ensure poll-captain-week-02 has active status and dates
  const captainPoll = g.__bb_polls.find((p: any) => p.id === "poll-captain-week-02");
  if (captainPoll) {
    captainPoll.status = "ACTIVE";
    captainPoll.startsAt = "2026-09-13T00:00:00+05:30";
    captainPoll.endsAt = "2026-09-18T23:59:59+05:30";
  }
}

const users: Map<string, ServerUser> = g.__bb_users;
const votes: ServerVote[] = g.__bb_votes;
const polls: any[] = g.__bb_polls;

function hashPassword(plain: string): string {
  return crypto.createHmac("sha256", PWD_SALT).update(plain).digest("hex");
}

function generateToken(user: ServerUser): string {
  const payload = {
    sub: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 3600 * 1000,
  };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch (_) {
    return null;
  }
}

function extractUserFromReq(req: NextRequest): ServerUser | null {
  const authHeader = req.headers.get("authorization");
  let token: string | undefined;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else {
    token = req.cookies.get("access_token")?.value;
  }
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || !payload.sub) return null;
  return users.get(payload.sub) || null;
}

export async function GET(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug || [];
  const path = slug.join("/");

  // 1. Health
  if (path === "health") {
    return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
  }

  // 2. Auth Current User (/auth/me)
  if (path === "auth/me") {
    const user = extractUserFromReq(req);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized", statusCode: 401 }, { status: 401 });
    }
    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  }

  // 3. Polls (/polls)
  if (path === "polls") {
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status");

    const result = polls.map((p) => {
      const scheduleOpen = isVotingScheduleOpen(p);
      const effectiveStatus = !scheduleOpen ? "CLOSED" : p.status;
      return {
        ...p,
        status: effectiveStatus,
      };
    });

    if (statusFilter) {
      return NextResponse.json(
        result.filter((p) => p.status.toLowerCase() === statusFilter.toLowerCase())
      );
    }
    return NextResponse.json(result);
  }

  // 4. Single Poll (/polls/:id)
  if (slug.length === 2 && slug[0] === "polls") {
    const pollId = slug[1];
    const poll = polls.find((p) => p.id === pollId) || fallbackPolls.find((p) => p.id === pollId);
    if (!poll) {
      return NextResponse.json({ message: "Poll not found", statusCode: 404 }, { status: 404 });
    }
    const scheduleOpen = isVotingScheduleOpen(poll);
    const effectiveStatus = !scheduleOpen ? "CLOSED" : poll.status;
    return NextResponse.json({
      ...poll,
      status: effectiveStatus,
    });
  }

  // 5. Vote Status (/polls/:id/vote-status)
  if (slug.length === 3 && slug[0] === "polls" && slug[2] === "vote-status") {
    const pollId = slug[1];
    const user = extractUserFromReq(req);
    if (!user) {
      return NextResponse.json({ hasVoted: false });
    }
    const todayStr = new Date().toISOString().slice(0, 10);
    const existing = votes.find((v) => v.pollId === pollId && v.userId === user.id && v.date === todayStr);
    if (existing) {
      const poll = polls.find((p) => p.id === pollId);
      const opt = poll?.options?.find((o: any) => o.id === existing.optionId);
      let contestantName = opt?.text?.replace(/Save\s*/i, "")?.replace(/Vote\s*/i, "")?.replace(/\s*for Captain/i, "")?.trim();
      return NextResponse.json({
        hasVoted: true,
        optionId: existing.optionId,
        contestantName: contestantName || "your selected housemate",
      });
    }
    return NextResponse.json({ hasVoted: false });
  }

  // 6. Contestants (/contestants)
  if (path === "contestants") {
    return NextResponse.json(fallbackContestants);
  }

  // 7. Contestant Rankings (/contestants/rankings)
  if (path === "contestants/rankings") {
    const rankings = fallbackContestants
      .filter((c) => !c.isEliminated && c.status !== "ELIMINATED")
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
    return NextResponse.json(rankings);
  }

  // 8. Single Contestant (/contestants/:id)
  if (slug.length === 2 && slug[0] === "contestants") {
    const cid = slug[1];
    const c = fallbackContestants.find((item) => item.id === cid || item.slug === cid);
    if (!c) {
      return NextResponse.json({ message: "Contestant not found", statusCode: 404 }, { status: 404 });
    }
    return NextResponse.json(c);
  }

  // 9. News (/news)
  if (path === "news") {
    return NextResponse.json(fallbackNews);
  }

  return NextResponse.json({ message: "Not found", statusCode: 404 }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: { slug: string[] } }) {
  const slug = params.slug || [];
  const path = slug.join("/");

  // 1. User Registration (/auth/register)
  if (path === "auth/register") {
    const body = await req.json().catch(() => ({}));
    const username = (body.username || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!username || !email || !password) {
      return NextResponse.json({ message: "All fields are required.", statusCode: 400 }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters.", statusCode: 400 }, { status: 400 });
    }

    // Duplicate account check (Section 17: HTTP 409 "Username or email already registered.")
    for (const u of Array.from(users.values())) {
      if (u.email.toLowerCase() === email || u.username.toLowerCase() === username.toLowerCase()) {
        return NextResponse.json(
          { message: "Username or email already registered.", statusCode: 409, error: "Conflict" },
          { status: 409 }
        );
      }
    }

    const newUser: ServerUser = {
      id: "user-" + crypto.randomBytes(8).toString("hex"),
      username,
      email,
      passwordHash: hashPassword(password),
      role: "USER",
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
      bio: "Bigg Boss Telugu Superfan! Ready to debate and vote.",
      createdAt: new Date().toISOString(),
    };

    users.set(newUser.id, newUser);
    const token = generateToken(newUser);

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          avatarUrl: newUser.avatarUrl,
          bio: newUser.bio,
          createdAt: newUser.createdAt,
        },
        token,
      },
      { status: 201 }
    );
  }

  // 2. User Login (/auth/login)
  if (path === "auth/login") {
    const body = await req.json().catch(() => ({}));
    const identifier = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    let foundUser: ServerUser | undefined;
    for (const u of Array.from(users.values())) {
      if (u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser || foundUser.passwordHash !== hashPassword(password)) {
      return NextResponse.json(
        { message: "Invalid email or password", statusCode: 401, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = generateToken(foundUser);
    return NextResponse.json({
      user: {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role,
        avatarUrl: foundUser.avatarUrl,
        bio: foundUser.bio,
        createdAt: foundUser.createdAt,
      },
      token,
    });
  }

  // 3. User Logout (/auth/logout)
  if (path === "auth/logout") {
    return NextResponse.json({ success: true, message: "Logged out successfully." });
  }

  // 4. Cast Vote (/polls/:id/votes)
  if (slug.length === 3 && slug[0] === "polls" && slug[2] === "votes") {
    const pollId = slug[1];
    const body = await req.json().catch(() => ({}));
    const optionId = body.optionId;

    // 4a. Authenticate User (Part 9: Anonymous voting is NOT allowed)
    const user = extractUserFromReq(req);
    if (!user) {
      return NextResponse.json(
        { message: "Authentication required to vote. Please sign in or sign up.", statusCode: 401, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 4b. Find Poll
    let poll = polls.find((p) => p.id === pollId);
    if (!poll) {
      return NextResponse.json({ message: "Poll does not exist", statusCode: 404 }, { status: 404 });
    }

    // 4c. Validate Schedule (Section 4: Reject votes outside schedule)
    const scheduleOpen = isVotingScheduleOpen(poll);
    if (poll.status === "CLOSED" || !scheduleOpen || poll.status !== "ACTIVE") {
      return NextResponse.json(
        { message: "Voting is currently closed.", statusCode: 400, error: "Bad Request" },
        { status: 400 }
      );
    }

    // 4d. Validate Option
    const option = poll.options?.find((o: any) => o.id === optionId);
    if (!option) {
      return NextResponse.json({ message: "Selected option does not belong to this poll", statusCode: 400 }, { status: 400 });
    }

    // 4e. Validate not eliminated
    if (option.contestantId === "c-10" || option.contestantId === "c-13") {
      return NextResponse.json({ message: "Voting is not permitted for eliminated contestants.", statusCode: 400 }, { status: 400 });
    }

    // 4f. Check duplicate vote today (1 vote per user per day/poll)
    const todayStr = new Date().toISOString().slice(0, 10);
    const existing = votes.find((v) => v.pollId === pollId && v.userId === user.id && v.date === todayStr);
    if (existing) {
      return NextResponse.json(
        {
          message: "You have already cast your vote today. Only 1 vote per user per day is allowed.",
          statusCode: 409,
          error: "ALREADY_VOTED",
        },
        { status: 409 }
      );
    }

    // 4g. Record Vote
    votes.push({
      pollId,
      optionId,
      userId: user.id,
      date: todayStr,
    });

    poll.totalVotes = (poll.totalVotes || 0) + 1;
    option.votesCount = (option.votesCount || 0) + 1;

    const contestantName = option.text
      .replace(/Save\s*/i, "")
      .replace(/Vote\s*/i, "")
      .replace(/\s*for Captain/i, "")
      .trim();

    return NextResponse.json({
      success: true,
      message: "Your vote has been securely recorded!",
      pollId,
      totalVotes: poll.totalVotes,
      optionId,
      contestantName,
      options: poll.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        contestantId: opt.contestantId,
        votesCount: opt.votesCount || 0,
        percentage: poll.totalVotes > 0 ? parseFloat(((opt.votesCount / poll.totalVotes) * 100).toFixed(1)) : 0,
      })),
    });
  }

  return NextResponse.json({ message: "Not found", statusCode: 404 }, { status: 404 });
}

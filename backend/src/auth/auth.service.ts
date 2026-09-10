import { Injectable, UnauthorizedException, ConflictException, ForbiddenException, NotFoundException } from "@nestjs/common";
import { DatabaseService, User } from "../database/database.service";
import { v4 as uuidv4 } from "uuid";
import * as crypto from "crypto";

export interface TokenPayload {
  sub: string;
  username: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}

@Injectable()
export class AuthService {
  private readonly jwtSecret = process.env.JWT_SECRET || "bb_super_secret_jwt_key_2026";

  constructor(private readonly db: DatabaseService) {}

  public hashPassword(password: string): string {
    return this.db.hashValue(password, "bb_fans_pwd_salt");
  }

  public verifyPassword(plainPassword: string, storedHash: string): boolean {
    const candidateHash = this.hashPassword(plainPassword);
    const bufCandidate = Buffer.from(candidateHash);
    const bufStored = Buffer.from(storedHash);
    if (bufCandidate.length === bufStored.length && crypto.timingSafeEqual(bufCandidate, bufStored)) {
      return true;
    }
    if (storedHash === candidateHash) {
      return true;
    }
    return false;
  }

  public generateToken(user: User): string {
    const payload: TokenPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 3600 * 1000 })).toString("base64url");
    const signature = crypto.createHmac("sha256", this.jwtSecret).update(`${header}.${body}`).digest("base64url");
    return `${header}.${body}.${signature}`;
  }

  public verifyToken(token: string): TokenPayload {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new UnauthorizedException("Invalid token format");
      }
      const [header, body, signature] = parts;
      const expectedSignature = crypto.createHmac("sha256", this.jwtSecret).update(`${header}.${body}`).digest("base64url");
      if (signature !== expectedSignature) {
        throw new UnauthorizedException("Invalid token signature");
      }
      const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
      if (payload.exp && Date.now() > payload.exp) {
        throw new UnauthorizedException("Session has expired");
      }
      return payload;
    } catch (e) {
      throw new UnauthorizedException("Authentication session expired or invalid");
    }
  }

  public async register(dto: { username: string; email: string; password: string }) {
    for (const u of this.db.users.values()) {
      if (u.email.toLowerCase() === dto.email.toLowerCase()) {
        throw new ConflictException("An account with this email already exists");
      }
      if (u.username.toLowerCase() === dto.username.toLowerCase()) {
        throw new ConflictException("Username is already taken");
      }
    }

    const newUser: User = {
      id: uuidv4(),
      username: dto.username.trim(),
      email: dto.email.trim().toLowerCase(),
      passwordHash: this.hashPassword(dto.password),
      role: "USER",
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(dto.username)}`,
      bio: "Bigg Boss Telugu Superfan! Ready to debate and vote.",
      isBanned: false,
      isSuspended: false,
      createdAt: new Date(),
    };

    this.db.users.set(newUser.id, newUser);
    const token = this.generateToken(newUser);

    return {
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
    };
  }

  public async login(dto: { email: string; password: string }) {
    const identifier = dto.email.trim().toLowerCase();
    let foundUser: User | undefined;
    for (const u of this.db.users.values()) {
      if (
        u.email.toLowerCase() === identifier ||
        u.username.toLowerCase() === identifier
      ) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!this.verifyPassword(dto.password, foundUser.passwordHash)) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (foundUser.isBanned) {
      throw new ForbiddenException("Your account has been suspended for violation of community guidelines");
    }

    const token = this.generateToken(foundUser);
    return {
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
    };
  }

  public async googleLogin(dto: { googleId: string; email: string; name: string; avatarUrl?: string }) {
    let user: User | undefined;
    for (const u of this.db.users.values()) {
      if (u.email.toLowerCase() === dto.email.toLowerCase()) {
        user = u;
        break;
      }
    }

    if (!user) {
      const username = (dto.name.replace(/\s+/g, "_") + "_" + Math.floor(100 + Math.random() * 900)).toLowerCase();
      user = {
        id: uuidv4(),
        username,
        email: dto.email.toLowerCase(),
        passwordHash: this.hashPassword(uuidv4()), // random password for OAuth user
        role: "USER",
        avatarUrl: dto.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`,
        bio: "Joined via Google authentication",
        isBanned: false,
        isSuspended: false,
        createdAt: new Date(),
      };
      this.db.users.set(user.id, user);
    }

    if (user.isBanned) {
      throw new ForbiddenException("Your account has been suspended");
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  public async getProfile(userId: string) {
    const user = this.db.users.get(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Aggregate user activity stats
    let postsCount = 0;
    let commentsCount = 0;
    let votesCount = 0;

    for (const p of this.db.posts.values()) {
      if (p.userId === userId && !p.isDeleted) postsCount++;
    }
    for (const c of this.db.comments.values()) {
      if (c.userId === userId && !c.isDeleted) commentsCount++;
    }
    for (const v of this.db.votes.values()) {
      if (v.userId === userId) votesCount++;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
      stats: {
        postsCount,
        commentsCount,
        votesCount,
        badges: ["Early Pioneer", "House Insider", "Top Debater"],
      },
    };
  }
}

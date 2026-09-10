import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import * as crypto from "crypto";

export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

@Injectable()
export class RedisRateLimiterService {
  private maxVotesPerIp: number = parseInt(process.env.MAX_VOTES_PER_IP || "50", 10);
  private readonly windowMs: number = 24 * 60 * 60 * 1000; // 24 Hours
  private ipCounters: Map<string, RateLimitEntry> = new Map();
  private readonly hmacSalt: string = process.env.IP_HMAC_SALT || "bb_fans_ip_salt_2026";

  /**
   * Hashes the IP using HMAC-SHA256 for privacy (Section 27)
   */
  public hashIp(ip: string): string {
    const cleanIp = ip.replace(/^.*:/, "").trim() || "127.0.0.1";
    return crypto.createHmac("sha256", this.hmacSalt).update(cleanIp).digest("hex");
  }

  /**
   * Configurable threshold management by Admin (Section 21)
   */
  public getMaxVotesPerIp(): number {
    return this.maxVotesPerIp;
  }

  public setMaxVotesPerIp(limit: number): void {
    if (limit < 1) throw new Error("Limit must be at least 1");
    this.maxVotesPerIp = limit;
  }

  /**
   * Check if the IP has reached the configured threshold.
   * If reached, throws HTTP 429 Too Many Requests (TC-VOTE-008, TC-VOTE-009)
   */
  public async checkRateLimit(ipHash: string): Promise<{ currentCount: number; maxAllowed: number }> {
    const now = Date.now();
    const entry = this.ipCounters.get(ipHash);

    if (entry) {
      if (now > entry.resetTime) {
        // Window expired, reset
        this.ipCounters.delete(ipHash);
      } else if (entry.count >= this.maxVotesPerIp) {
        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            error: "Too Many Requests",
            message: `Network IP vote threshold reached (${this.maxVotesPerIp} votes per 24h window). Please try again later.`,
          },
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
    }

    return {
      currentCount: entry ? entry.count : 0,
      maxAllowed: this.maxVotesPerIp,
    };
  }

  /**
   * Atomic increment of vote count for the IP within window.
   */
  public async incrementVoteCount(ipHash: string): Promise<number> {
    const now = Date.now();
    let entry = this.ipCounters.get(ipHash);

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      this.ipCounters.set(ipHash, entry);
      return 1;
    }

    entry.count += 1;
    return entry.count;
  }

  /**
   * Decrement counter in case of database transaction rollback
   */
  public async decrementVoteCount(ipHash: string): Promise<void> {
    const entry = this.ipCounters.get(ipHash);
    if (entry && entry.count > 0) {
      entry.count -= 1;
    }
  }

  /**
   * Helper for testing/clearing
   */
  public clearAll(): void {
    this.ipCounters.clear();
  }
}

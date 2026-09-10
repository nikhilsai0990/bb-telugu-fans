import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { RedisRateLimiterService } from "../redis/redis-rate-limiter.service";

@Injectable()
export class AdminService {
  constructor(
    private readonly db: DatabaseService,
    private readonly rateLimiter: RedisRateLimiterService,
  ) {}

  public getOverview() {
    let totalVotes = 0;
    for (const p of this.db.polls.values()) {
      totalVotes += p.totalVotes;
    }

    let pendingReports = 0;
    for (const r of this.db.reports.values()) {
      if (r.status === "PENDING") pendingReports++;
    }

    const activeUsers = Array.from(this.db.users.values()).filter((u) => !u.isBanned).length;

    return {
      metrics: {
        totalUsers: this.db.users.size,
        activeUsers,
        totalVotes,
        totalPolls: this.db.polls.size,
        totalPosts: this.db.posts.size,
        totalComments: this.db.comments.size,
        pendingReports,
        totalNews: this.db.news.size,
        totalMemes: this.db.memes.size,
        maxVotesPerIpThreshold: this.rateLimiter.getMaxVotesPerIp(),
      },
      traffic: {
        dailyPageviews: 48290,
        uniqueVisitors: 12450,
        avgSessionDuration: "4m 32s",
        peakConcurrentUsers: 2410,
      },
    };
  }

  public getAuditLogs() {
    return this.db.auditLogs;
  }

  public updateIpThreshold(limit: number, adminId: string, adminUsername: string) {
    this.rateLimiter.setMaxVotesPerIp(limit);
    this.db.logAudit("UPDATE_IP_RATE_LIMIT", { newThreshold: limit }, adminId, adminUsername);
    return {
      success: true,
      maxVotesPerIp: limit,
      message: `Configured anti-abuse network threshold updated to ${limit} votes per 24 hours.`,
    };
  }
}

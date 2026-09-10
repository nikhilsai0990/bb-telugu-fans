import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { DatabaseService, Report } from "../database/database.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ModerationService {
  constructor(private readonly db: DatabaseService) {}

  public submitReport(params: {
    userId?: string;
    entityType: "POST" | "COMMENT" | "MEME" | "USER";
    entityId: string;
    reason: string;
    details?: string;
  }): Report {
    if (!params.reason || params.reason.trim().length < 3) {
      throw new BadRequestException("A valid report reason is required");
    }

    const report: Report = {
      id: uuidv4(),
      userId: params.userId,
      entityType: params.entityType,
      entityId: params.entityId,
      reason: params.reason.trim(),
      details: params.details,
      status: "PENDING",
      createdAt: new Date(),
    };

    this.db.reports.set(report.id, report);
    return report;
  }

  public getAllReports(status?: "PENDING" | "RESOLVED" | "DISMISSED") {
    let reports = Array.from(this.db.reports.values());
    if (status) {
      reports = reports.filter((r) => r.status === status);
    }
    return reports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public resolveReport(reportId: string, adminId: string, adminUsername: string, action: "DISMISS" | "DELETE" | "BAN_USER") {
    const report = this.db.reports.get(reportId);
    if (!report) {
      throw new NotFoundException("Report not found");
    }

    if (action === "DELETE") {
      if (report.entityType === "POST") {
        const post = this.db.posts.get(report.entityId);
        if (post) post.isDeleted = true;
      } else if (report.entityType === "COMMENT") {
        const comment = this.db.comments.get(report.entityId);
        if (comment) comment.isDeleted = true;
      } else if (report.entityType === "MEME") {
        const meme = this.db.memes.get(report.entityId);
        if (meme) meme.isApproved = false;
      }
    } else if (action === "BAN_USER") {
      const user = this.db.users.get(report.entityId);
      if (user) user.isBanned = true;
    }

    report.status = action === "DISMISS" ? "DISMISSED" : "RESOLVED";
    this.db.logAudit(`REPORT_${action}`, { reportId, entityType: report.entityType, entityId: report.entityId }, adminId, adminUsername);

    return { success: true, report };
  }

  public banUser(userId: string, adminId: string, adminUsername: string, reason: string) {
    const user = this.db.users.get(userId);
    if (!user) throw new NotFoundException("User not found");
    user.isBanned = true;
    this.db.logAudit("USER_BAN", { userId, username: user.username, reason }, adminId, adminUsername);
    return { success: true, message: `User ${user.username} has been banned.` };
  }

  public warnUser(userId: string, adminId: string, adminUsername: string, reason: string) {
    const user = this.db.users.get(userId);
    if (!user) throw new NotFoundException("User not found");
    this.db.logAudit("USER_WARN", { userId, username: user.username, reason }, adminId, adminUsername);
    return { success: true, message: `Official warning logged for ${user.username}.` };
  }
}

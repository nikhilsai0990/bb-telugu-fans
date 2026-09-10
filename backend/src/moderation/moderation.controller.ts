import { Controller, Get, Post, Param, Body, Query, UseGuards } from "@nestjs/common";
import { ModerationService } from "./moderation.service";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { RolesGuard, Roles } from "../auth/roles.guard";
import { TokenPayload } from "../auth/auth.service";

@Controller("moderation")
export class ModerationController {
  constructor(private readonly modService: ModerationService) {}

  @Post("reports")
  submitReport(
    @Body()
    body: {
      entityType: "POST" | "COMMENT" | "MEME" | "USER";
      entityId: string;
      reason: string;
      details?: string;
    },
  ) {
    return this.modService.submitReport(body);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN", "MODERATOR")
  @Get("reports")
  getReports(@Query("status") status?: "PENDING" | "RESOLVED" | "DISMISSED") {
    return this.modService.getAllReports(status);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN", "MODERATOR")
  @Post("reports/:id/resolve")
  resolveReport(
    @Param("id") id: string,
    @Body() body: { action: "DISMISS" | "DELETE" | "BAN_USER" },
    @CurrentUser() user: TokenPayload,
  ) {
    return this.modService.resolveReport(id, user.sub, user.username, body.action);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post("users/:id/ban")
  banUser(
    @Param("id") id: string,
    @Body() body: { reason: string },
    @CurrentUser() user: TokenPayload,
  ) {
    return this.modService.banUser(id, user.sub, user.username, body.reason);
  }
}

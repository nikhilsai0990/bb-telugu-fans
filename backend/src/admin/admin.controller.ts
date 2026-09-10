import { Controller, Get, Post, Put, Body, Param, UseGuards } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { PollsService } from "../polls/polls.service";
import { ContestantsService } from "../contestants/contestants.service";
import { NewsService } from "../news/news.service";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { RolesGuard, Roles } from "../auth/roles.guard";
import { TokenPayload } from "../auth/auth.service";
import { CreatePollDto } from "../polls/dto/vote.dto";
import { PollStatus } from "../database/database.service";

@UseGuards(AuthGuard, RolesGuard)
@Roles("ADMIN")
@Controller("admin")
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly pollsService: PollsService,
    private readonly contestantsService: ContestantsService,
    private readonly newsService: NewsService,
  ) {}

  @Get("overview")
  getOverview() {
    return this.adminService.getOverview();
  }

  @Get("audit-logs")
  getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  @Post("settings/ip-limit")
  updateIpLimit(@Body() body: { limit: number }, @CurrentUser() user: TokenPayload) {
    return this.adminService.updateIpThreshold(body.limit, user.sub, user.username);
  }

  @Post("polls")
  createPoll(@Body() dto: CreatePollDto) {
    return this.pollsService.createPoll(dto);
  }

  @Put("polls/:id/status")
  updatePollStatus(@Param("id") id: string, @Body() body: { status: PollStatus }) {
    return this.pollsService.updatePollStatus(id, body.status);
  }

  @Post("contestants")
  createContestant(@Body() body: any) {
    return this.contestantsService.createContestant(body);
  }

  @Put("contestants/:id")
  updateContestant(@Param("id") id: string, @Body() body: any) {
    return this.contestantsService.updateContestant(id, body);
  }

  @Post("news")
  createNews(@Body() body: any) {
    return this.newsService.create(body);
  }
}

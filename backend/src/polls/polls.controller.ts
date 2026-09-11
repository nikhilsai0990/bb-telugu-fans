import { Controller, Get, Post, Param, Body, Query, Req, UseGuards, Ip, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { Request } from "express";
import { PollsService } from "./polls.service";
import { CastVoteDto, CreatePollDto } from "./dto/vote.dto";
import { AuthService } from "../auth/auth.service";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard, Roles } from "../auth/roles.guard";

@Controller("polls")
export class PollsController {
  constructor(
    private readonly pollsService: PollsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getAllPolls(@Query("status") status?: string) {
    return this.pollsService.getAllPolls(status);
  }

  @Get(":id")
  getPollById(@Param("id") id: string) {
    return this.pollsService.getPollById(id);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Post(":id/reset")
  resetPoll(@Param("id") id: string) {
    return this.pollsService.resetPoll(id);
  }

  @Get(":id/vote-status")
  async getVoteStatus(
    @Param("id") pollId: string,
    @Query("voterToken") voterTokenQuery: string,
    @Query("userId") userIdQuery: string,
    @Req() req: Request,
  ) {
    let userId: string | undefined = userIdQuery;
    const authHeader = req.headers["authorization"];
    const cookieToken = req.cookies ? req.cookies["access_token"] : undefined;
    const token = (authHeader && authHeader.startsWith("Bearer ")) ? authHeader.substring(7).trim() : cookieToken;

    if (token) {
      try {
        const decoded = this.authService.verifyToken(token);
        userId = decoded.sub;
      } catch (err) {}
    }

    if (!userId) {
      return { hasVoted: false };
    }

    return this.pollsService.getVoterStatus({
      pollId,
      userId,
    });
  }

  @Post(":id/votes")
  async vote(
    @Param("id") pollId: string,
    @Body() body: CastVoteDto,
    @Req() req: Request,
  ) {
    if (!body || !body.optionId) {
      throw new BadRequestException("Option ID is required");
    }

    // Extract real client IP (Cloudflare CF-Connecting-IP, X-Forwarded-For, or req.ip)
    const clientIp = (req.headers["cf-connecting-ip"] as string) ||
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    // Extract user token strictly from Authorization header or secure cookie
    let userId: string | undefined = undefined;
    const authHeader = req.headers["authorization"];
    const cookieToken = req.cookies ? req.cookies["access_token"] : undefined;
    const token = (authHeader && authHeader.startsWith("Bearer ")) ? authHeader.substring(7).trim() : cookieToken;

    if (token) {
      try {
        const decoded = this.authService.verifyToken(token);
        userId = decoded.sub;
      } catch (err) {
        throw new UnauthorizedException("Authentication session expired or invalid. Please sign in again.");
      }
    }

    if (!userId) {
      throw new UnauthorizedException("Authentication required to vote. Please sign in or sign up.");
    }

    return this.pollsService.castVote({
      pollId,
      optionId: body.optionId,
      userId,
      clientIp,
    });
  }
}

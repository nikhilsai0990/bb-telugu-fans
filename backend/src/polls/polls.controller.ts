import { Controller, Get, Post, Param, Body, Query, Req, UseGuards, Ip, BadRequestException } from "@nestjs/common";
import { Request } from "express";
import { PollsService } from "./polls.service";
import { CastVoteDto, CreatePollDto } from "./dto/vote.dto";
import { AuthService } from "../auth/auth.service";

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

  @Post(":id/reset")
  resetPoll(@Param("id") id: string) {
    return this.pollsService.resetPoll(id);
  }

  @Get(":id/vote-status")
  async getVoteStatus(
    @Param("id") pollId: string,
    @Query("voterToken") voterTokenQuery: string,
    @Req() req: Request,
  ) {
    let userId: string | undefined;
    const authHeader = req.headers["authorization"];
    const cookieToken = req.cookies ? req.cookies["access_token"] : undefined;
    const token = (authHeader && authHeader.startsWith("Bearer ")) ? authHeader.substring(7) : cookieToken;

    if (token) {
      try {
        const decoded = this.authService.verifyToken(token);
        userId = decoded.sub;
      } catch (err) {}
    }

    const voterToken = (req.headers["x-voter-token"] as string) || voterTokenQuery;

    return this.pollsService.getVoterStatus({
      pollId,
      userId,
      voterToken,
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
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    // Optional user token
    let userId: string | undefined;
    const authHeader = req.headers["authorization"];
    const cookieToken = req.cookies ? req.cookies["access_token"] : undefined;
    const token = (authHeader && authHeader.startsWith("Bearer ")) ? authHeader.substring(7) : cookieToken;

    if (token) {
      try {
        const decoded = this.authService.verifyToken(token);
        userId = decoded.sub;
      } catch (err) {
        // Token invalid, fall back to anonymous voter token if present
      }
    }

    return this.pollsService.castVote({
      pollId,
      optionId: body.optionId,
      userId,
      voterToken: body.voterToken,
      clientIp,
    });
  }
}

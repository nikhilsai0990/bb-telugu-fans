import { Controller, Get, Post, Param, Body, UseGuards, Req } from "@nestjs/common";
import { MemesService } from "./memes.service";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { TokenPayload } from "../auth/auth.service";

@Controller("memes")
export class MemesController {
  constructor(private readonly memesService: MemesService) {}

  @Get()
  getAll() {
    return this.memesService.getAll();
  }

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() body: { title: string; imageUrl: string }, @CurrentUser() user: TokenPayload) {
    return this.memesService.create(user.sub, user.username, body.title, body.imageUrl);
  }

  @Post(":id/like")
  like(@Param("id") id: string) {
    return this.memesService.like(id);
  }
}

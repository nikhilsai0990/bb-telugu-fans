import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { DiscussService } from "./discuss.service";
import { AuthGuard, CurrentUser } from "../auth/auth.guard";
import { TokenPayload } from "../auth/auth.service";

@Controller("posts")
export class DiscussController {
  constructor(private readonly discussService: DiscussService) {}

  @Get()
  getAllPosts(
    @Query("category") category?: string,
    @Query("sort") sort?: "latest" | "trending" | "top",
    @Query("search") search?: string,
    @Query("userId") userId?: string,
  ) {
    return this.discussService.getAllPosts({ category, sort, search, userId });
  }

  @Get(":id")
  getPostById(@Param("id") id: string) {
    return this.discussService.getPostById(id);
  }

  @UseGuards(AuthGuard)
  @Post()
  createPost(
    @Body() body: { title: string; description: string; category?: string; imageUrl?: string },
    @CurrentUser() user: TokenPayload,
  ) {
    return this.discussService.createPost({
      userId: user.sub,
      username: user.username,
      category: body.category || "General Talk",
      title: body.title,
      description: body.description,
      imageUrl: body.imageUrl,
    });
  }

  @UseGuards(AuthGuard)
  @Put(":id")
  editPost(
    @Param("id") id: string,
    @Body() body: { title?: string; description?: string },
    @CurrentUser() user: TokenPayload,
  ) {
    return this.discussService.editPost(id, user.sub, body.title, body.description);
  }

  @UseGuards(AuthGuard)
  @Delete(":id")
  deletePost(@Param("id") id: string, @CurrentUser() user: TokenPayload) {
    const isAdmin = user.role === "ADMIN" || user.role === "MODERATOR";
    return this.discussService.deletePost(id, user.sub, isAdmin);
  }

  @UseGuards(AuthGuard)
  @Post(":id/like")
  toggleLike(@Param("id") id: string, @CurrentUser() user: TokenPayload) {
    return this.discussService.toggleLike(id, user.sub);
  }

  @UseGuards(AuthGuard)
  @Post(":id/save")
  toggleSave(@Param("id") id: string, @CurrentUser() user: TokenPayload) {
    return this.discussService.toggleSave(id, user.sub);
  }

  @UseGuards(AuthGuard)
  @Post(":id/comments")
  addComment(
    @Param("id") id: string,
    @Body() body: { content: string; parentCommentId?: string },
    @CurrentUser() user: TokenPayload,
  ) {
    return this.discussService.addComment({
      postId: id,
      userId: user.sub,
      username: user.username,
      content: body.content,
      parentCommentId: body.parentCommentId,
    });
  }

  @UseGuards(AuthGuard)
  @Delete(":id/comments/:commentId")
  deleteComment(
    @Param("commentId") commentId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    const isAdmin = user.role === "ADMIN" || user.role === "MODERATOR";
    return this.discussService.deleteComment(commentId, user.sub, isAdmin);
  }
}

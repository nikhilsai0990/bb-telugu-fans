import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { DatabaseService, Post, Comment } from "../database/database.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class DiscussService {
  // Simple spam throttling map: userId -> lastPostTimestamp
  private userLastPostTime: Map<string, number> = new Map();

  constructor(private readonly db: DatabaseService) {}

  /**
   * XSS sanitization (Section 28)
   */
  private sanitizeInput(text: string): string {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  public getAllPosts(params: {
    category?: string;
    sort?: "latest" | "trending" | "top";
    search?: string;
    userId?: string;
  }) {
    let posts = Array.from(this.db.posts.values()).filter((p) => !p.isDeleted);

    if (params.category && params.category !== "All Discussions") {
      posts = posts.filter((p) => p.category.toLowerCase() === params.category.toLowerCase());
    }

    if (params.search && params.search.trim() !== "") {
      const q = params.search.toLowerCase();
      posts = posts.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    if (params.userId) {
      posts = posts.filter((p) => p.userId === params.userId);
    }

    if (params.sort === "top") {
      posts.sort((a, b) => b.likesCount - a.likesCount);
    } else if (params.sort === "trending") {
      posts.sort((a, b) => b.commentsCount * 2 + b.likesCount - (a.commentsCount * 2 + a.likesCount));
    } else {
      // Latest
      posts.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    }

    return posts;
  }

  public getPostById(id: string) {
    const post = this.db.posts.get(id);
    if (!post || post.isDeleted) {
      throw new NotFoundException("Post not found");
    }
    const comments = Array.from(this.db.comments.values())
      .filter((c) => c.postId === id && !c.isDeleted)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return { ...post, comments };
  }

  public createPost(params: {
    userId: string;
    username: string;
    userAvatar?: string;
    category: string;
    title: string;
    description: string;
    imageUrl?: string;
  }) {
    // 1. Spam throttling check (min 5 seconds between posts)
    const now = Date.now();
    const lastTime = this.userLastPostTime.get(params.userId);
    if (lastTime && now - lastTime < 5000) {
      throw new BadRequestException("Posting too rapidly. Please wait a few moments before posting again.");
    }

    if (!params.title || params.title.trim().length < 5) {
      throw new BadRequestException("Post title must be at least 5 characters");
    }
    if (!params.description || params.description.trim().length < 10) {
      throw new BadRequestException("Post description must be at least 10 characters");
    }

    const post: Post = {
      id: uuidv4(),
      userId: params.userId,
      username: params.username,
      userAvatar: params.userAvatar,
      category: params.category || "General Talk",
      title: this.sanitizeInput(params.title.trim()),
      description: this.sanitizeInput(params.description.trim()),
      imageUrl: params.imageUrl,
      likesCount: 0,
      commentsCount: 0,
      isPinned: false,
      isDeleted: false,
      createdAt: new Date(),
    };

    this.db.posts.set(post.id, post);
    this.userLastPostTime.set(params.userId, now);
    return post;
  }

  public editPost(postId: string, userId: string, title?: string, description?: string) {
    const post = this.db.posts.get(postId);
    if (!post || post.isDeleted) {
      throw new NotFoundException("Post not found");
    }
    if (post.userId !== userId) {
      throw new ForbiddenException("You can only edit your own posts");
    }
    if (title) post.title = this.sanitizeInput(title.trim());
    if (description) post.description = this.sanitizeInput(description.trim());
    return post;
  }

  public deletePost(postId: string, userId: string, isAdmin: boolean = false) {
    const post = this.db.posts.get(postId);
    if (!post) {
      throw new NotFoundException("Post not found");
    }
    if (post.userId !== userId && !isAdmin) {
      throw new ForbiddenException("You do not have permission to delete this post");
    }
    post.isDeleted = true;
    return { success: true, message: "Post deleted" };
  }

  public toggleLike(postId: string, userId: string): { isLiked: boolean; likesCount: number } {
    const post = this.db.posts.get(postId);
    if (!post || post.isDeleted) {
      throw new NotFoundException("Post not found");
    }

    const key = `${postId}:${userId}`;
    let isLiked = false;
    if (this.db.postLikes.has(key)) {
      this.db.postLikes.delete(key);
      post.likesCount = Math.max(0, post.likesCount - 1);
      isLiked = false;
    } else {
      this.db.postLikes.add(key);
      post.likesCount += 1;
      isLiked = true;
    }

    return { isLiked, likesCount: post.likesCount };
  }

  public toggleSave(postId: string, userId: string): { isSaved: boolean } {
    const key = `${postId}:${userId}`;
    let isSaved = false;
    if (this.db.postSaves.has(key)) {
      this.db.postSaves.delete(key);
      isSaved = false;
    } else {
      this.db.postSaves.add(key);
      isSaved = true;
    }
    return { isSaved };
  }

  public addComment(params: {
    postId: string;
    userId: string;
    username: string;
    userAvatar?: string;
    content: string;
    parentCommentId?: string;
  }) {
    const post = this.db.posts.get(params.postId);
    if (!post || post.isDeleted) {
      throw new NotFoundException("Post not found");
    }

    if (!params.content || params.content.trim().length < 2) {
      throw new BadRequestException("Comment content is too short");
    }

    const comment: Comment = {
      id: uuidv4(),
      postId: params.postId,
      userId: params.userId,
      username: params.username,
      userAvatar: params.userAvatar,
      parentCommentId: params.parentCommentId,
      content: this.sanitizeInput(params.content.trim()),
      isDeleted: false,
      createdAt: new Date(),
    };

    this.db.comments.set(comment.id, comment);
    post.commentsCount += 1;
    return comment;
  }

  public deleteComment(commentId: string, userId: string, isAdmin: boolean = false) {
    const comment = this.db.comments.get(commentId);
    if (!comment) {
      throw new NotFoundException("Comment not found");
    }
    if (comment.userId !== userId && !isAdmin) {
      throw new ForbiddenException("Cannot delete someone else's comment");
    }
    comment.isDeleted = true;
    const post = this.db.posts.get(comment.postId);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
    }
    return { success: true, message: "Comment deleted" };
  }
}

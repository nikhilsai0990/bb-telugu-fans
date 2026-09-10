import { DatabaseService } from "../src/database/database.service";
import { DiscussService } from "../src/discuss/discuss.service";
import { ModerationService } from "../src/moderation/moderation.service";
import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";

describe("Discussion & Moderation Tests - Section 42", () => {
  let db: DatabaseService;
  let discussService: DiscussService;
  let modService: ModerationService;

  beforeEach(() => {
    db = new DatabaseService();
    db.onModuleInit();
    discussService = new DiscussService(db);
    modService = new ModerationService(db);
  });

  it("DISC-001: Create post succeeds with valid input", () => {
    const post = discussService.createPost({
      userId: "fan-user-001",
      username: "TeluguBigBossLover",
      category: "General Talk",
      title: "Who will lead the house best in Week 5?",
      description: "Analyzing the leadership prospects based on house dynamics.",
    });

    expect(post.id).toBeDefined();
    expect(post.likesCount).toBe(0);
    expect(post.commentsCount).toBe(0);
  });

  it("DISC-002: User can edit their own post", () => {
    const post = discussService.createPost({
      userId: "fan-user-001",
      username: "TeluguBigBossLover",
      category: "Fan Theories",
      title: "Original Title for Post",
      description: "Original description text here.",
    });

    const updated = discussService.editPost(
      post.id,
      "fan-user-001",
      "Updated Post Title Here",
      "Updated description with more insights."
    );

    expect(updated.title).toBe("Updated Post Title Here");
  });

  it("DISC-003: User can like and unlike a post", () => {
    const post = discussService.createPost({
      userId: "fan-user-001",
      username: "TeluguBigBossLover",
      category: "Nominations",
      title: "Like test post title",
      description: "Testing like toggle functionality.",
    });

    // Like
    const likeRes = discussService.toggleLike(post.id, "user-fan-2");
    expect(likeRes.isLiked).toBe(true);
    expect(likeRes.likesCount).toBe(1);

    // Unlike
    const unlikeRes = discussService.toggleLike(post.id, "user-fan-2");
    expect(unlikeRes.isLiked).toBe(false);
    expect(unlikeRes.likesCount).toBe(0);
  });

  it("DISC-004: Comment on discussion increments count", () => {
    const post = discussService.createPost({
      userId: "fan-user-001",
      username: "TeluguBigBossLover",
      category: "General Talk",
      title: "Comment discussion test",
      description: "Discussion thread for commenting.",
    });

    const comment = discussService.addComment({
      postId: post.id,
      userId: "fan-user-002",
      username: "CommenterGuy",
      content: "Great observation! Agree with this completely.",
    });

    expect(comment.id).toBeDefined();
    expect(db.posts.get(post.id)!.commentsCount).toBe(1);
  });

  it("DISC-005: User can report a post to moderation", () => {
    const post = discussService.createPost({
      userId: "spammer-user",
      username: "SpamBot",
      category: "Off Topic",
      title: "Suspicious spam link discussion",
      description: "Click here to win prizes now!",
    });

    const report = modService.submitReport({
      userId: "fan-user-001",
      entityType: "POST",
      entityId: post.id,
      reason: "Spam / Advertising",
      details: "Commercial link spam.",
    });

    expect(report.id).toBeDefined();
    expect(report.status).toBe("PENDING");

    // Admin resolves report by deleting content
    const resolveRes = modService.resolveReport(report.id, "admin-user-001", "BBAdminMaster", "DELETE");
    expect(resolveRes.report.status).toBe("RESOLVED");
    expect(db.posts.get(post.id)!.isDeleted).toBe(true);
  });

  it("DISC-006: Spam throttling rejects consecutive rapid submissions", () => {
    const userId = "fast-poster-01";
    discussService.createPost({
      userId,
      username: "FastPoster",
      category: "General Talk",
      title: "First Post Title Within Seconds",
      description: "First post description text.",
    });

    // Immediate second post within 5 seconds should be throttled
    expect(() => {
      discussService.createPost({
        userId,
        username: "FastPoster",
        category: "General Talk",
        title: "Second Post Immediately After",
        description: "Second post description text.",
      });
    }).toThrow(BadRequestException);
  });
});

import { DatabaseService } from "../src/database/database.service";
import { AuthService } from "../src/auth/auth.service";
import { DiscussService } from "../src/discuss/discuss.service";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";

describe("Security Tests - Section 41", () => {
  let db: DatabaseService;
  let authService: AuthService;
  let discussService: DiscussService;

  beforeEach(() => {
    db = new DatabaseService();
    db.onModuleInit();
    authService = new AuthService(db);
    discussService = new DiscussService(db);
  });

  it("SEC-001: XSS payload in discussions is sanitized and neutralized", () => {
    const maliciousTitle = "Normal Title <script>alert('xss')</script>";
    const maliciousDesc = '<img src=x onerror="alert(1)"> Great post!';

    const post = discussService.createPost({
      userId: "fan-user-001",
      username: "TeluguBigBossLover",
      category: "General Talk",
      title: maliciousTitle,
      description: maliciousDesc,
    });

    expect(post.title).not.toContain("<script>");
    expect(post.title).toContain("&lt;script&gt;");
    expect(post.description).not.toContain("<img");
    expect(post.description).toContain("&lt;img");
  });

  it("SEC-002: IDOR protection - user cannot edit another user's post", () => {
    const post = discussService.createPost({
      userId: "user-alice",
      username: "Alice",
      category: "Nominations",
      title: "Alice Post Title",
      description: "Alice Description Text",
    });

    expect(() => {
      discussService.editPost(post.id, "user-bob", "Bob Hacked Title");
    }).toThrow(ForbiddenException);
  });

  it("SEC-003: IDOR protection - normal user cannot delete another user's post", () => {
    const post = discussService.createPost({
      userId: "user-charlie",
      username: "Charlie",
      category: "Tasks",
      title: "Charlie Post Title",
      description: "Charlie Description Text",
    });

    expect(() => {
      discussService.deletePost(post.id, "user-dave", false);
    }).toThrow(ForbiddenException);
  });

  it("SEC-004: Passwords are never stored in plaintext", async () => {
    const plain = "SuperSecretPassword123!";
    const res = await authService.register({
      username: "SecTestUser",
      email: "sectest@bbtelugufans.com",
      password: plain,
    });

    const user = db.users.get(res.user.id)!;
    expect(user.passwordHash).not.toBe(plain);
    expect(user.passwordHash.length).toBeGreaterThan(32);
  });

  it("SEC-005: Tampered JWT token is rejected with UnauthorizedException", () => {
    const user = db.users.get("fan-user-001")!;
    const validToken = authService.generateToken(user);

    // Tamper with the token payload
    const parts = validToken.split(".");
    const tamperedPayload = Buffer.from(
      JSON.stringify({ sub: "admin-user-001", role: "ADMIN" })
    ).toString("base64url");
    const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

    expect(() => {
      authService.verifyToken(tamperedToken);
    }).toThrow(UnauthorizedException);
  });

  it("SEC-006: Duplicate username or email registration returns ConflictException with exact message", async () => {
    await authService.register({
      username: "DuplicateFan",
      email: "duplicate@bbtelugufans.com",
      password: "StrongPass123!",
    });

    await expect(
      authService.register({
        username: "DuplicateFan2",
        email: "duplicate@bbtelugufans.com",
        password: "StrongPass123!",
      })
    ).rejects.toThrow("Username or email already registered.");

    await expect(
      authService.register({
        username: "DuplicateFan",
        email: "other@bbtelugufans.com",
        password: "StrongPass123!",
      })
    ).rejects.toThrow("Username or email already registered.");
  });
});

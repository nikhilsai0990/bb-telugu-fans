import { DatabaseService } from "../src/database/database.service";
import { AuthService } from "../src/auth/auth.service";
import { DiscussService } from "../src/discuss/discuss.service";
import { ForbiddenException, UnauthorizedException, BadRequestException, HttpException, HttpStatus } from "@nestjs/common";
import * as crypto from "crypto";

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

  it("SEC-007: Forgot password prevents account enumeration", async () => {
    const res1 = await authService.forgotPassword({ email: "doesnotexist@example.com" }, "ip-enum-test");
    const res2 = await authService.forgotPassword({ email: "fan@bbtelugufans.com" }, "ip-enum-test-2");

    expect(res1.message).toBe("If an account exists for this email, you will receive a password reset link.");
    expect(res2.message).toBe("If an account exists for this email, you will receive a password reset link.");
  });

  it("SEC-008: Password reset token is stored only as SHA-256 hash, expires in 30 minutes, and is single-use", async () => {
    const res = await authService.forgotPassword({ email: "fan@bbtelugufans.com" }, "ip-token-test");
    const token = res._testToken!;
    expect(token).toBeDefined();
    expect(token.length).toBe(64); // 32 bytes hex

    // Verify token is NOT stored in plain text in database
    const storedTokens = Array.from(db.passwordResets.keys());
    expect(storedTokens).not.toContain(token);

    // Verify token hash is stored
    const expectedHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetRecord = db.passwordResets.get(expectedHash)!;
    expect(resetRecord).toBeDefined();
    expect(resetRecord.used).toBe(false);
    expect(resetRecord.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(resetRecord.expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + 30 * 60 * 1000 + 1000);

    // Reset password
    const resetRes = await authService.resetPassword({
      token,
      newPassword: "BrandNewSecurePass123!",
    });
    expect(resetRes.message).toContain("successfully reset");

    // Verify token is now marked used
    expect(resetRecord.used).toBe(true);

    // Single-use check: attempting to reuse token fails
    await expect(
      authService.resetPassword({
        token,
        newPassword: "AnotherNewPassword123!",
      })
    ).rejects.toThrow(BadRequestException);
  });

  it("SEC-009: Expired password reset token is rejected", async () => {
    const res = await authService.forgotPassword({ email: "fan@bbtelugufans.com" }, "ip-expire-test");
    const token = res._testToken!;
    const expectedHash = crypto.createHash("sha256").update(token).digest("hex");
    const resetRecord = db.passwordResets.get(expectedHash)!;

    // Simulate token expiration
    resetRecord.expiresAt = new Date(Date.now() - 1000);

    await expect(
      authService.resetPassword({
        token,
        newPassword: "ExpiredTokenAttempt123!",
      })
    ).rejects.toThrow("Password reset token has expired. Please request a new one.");
  });

  it("SEC-010: Forgot password requests are rate limited after 5 attempts", async () => {
    const clientIp = "192.168.10.99";
    for (let i = 0; i < 5; i++) {
      const res = await authService.forgotPassword({ email: "fan@bbtelugufans.com" }, clientIp);
      expect(res.message).toBe("If an account exists for this email, you will receive a password reset link.");
    }

    // 6th attempt should be blocked
    await expect(
      authService.forgotPassword({ email: "fan@bbtelugufans.com" }, clientIp)
    ).rejects.toThrow("Too many password reset requests. Please try again later.");
  });

  it("SEC-011: User can successfully authenticate with reset password", async () => {
    const res = await authService.forgotPassword({ email: "fan@bbtelugufans.com" }, "ip-login-test");
    const token = res._testToken!;

    await authService.resetPassword({
      token,
      newPassword: "NewSecretPassword2026!",
    });

    // Old password should fail
    await expect(
      authService.login({ email: "fan@bbtelugufans.com", password: "FanPass2026!" })
    ).rejects.toThrow(UnauthorizedException);

    // New password should succeed
    const loginRes = await authService.login({
      email: "fan@bbtelugufans.com",
      password: "NewSecretPassword2026!",
    });
    expect(loginRes.token).toBeDefined();
    expect(loginRes.user.email).toBe("fan@bbtelugufans.com");
  });
});

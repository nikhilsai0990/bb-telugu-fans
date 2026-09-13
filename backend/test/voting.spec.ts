import { DatabaseService } from "../src/database/database.service";
import { RedisRateLimiterService } from "../src/redis/redis-rate-limiter.service";
import { PollsService } from "../src/polls/polls.service";
import { BadRequestException, ConflictException, HttpException, HttpStatus, UnauthorizedException } from "@nestjs/common";

describe("Voting System - Comprehensive Automated Tests", () => {
  let db: DatabaseService;
  let rateLimiter: RedisRateLimiterService;
  let pollsService: PollsService;

  beforeEach(() => {
    db = new DatabaseService();
    db.onModuleInit();
    rateLimiter = new RedisRateLimiterService();
    rateLimiter.setMaxVotesPerIp(50);
    pollsService = new PollsService(db, rateLimiter);

    // Set poll to ACTIVE for voting mechanics tests (seed data has it CLOSED for Sunday)
    const p = db.polls.get("poll-eviction-01");
    if (p) {
      p.status = "ACTIVE";
    }
  });

  // TC-VOTE-001: Valid authenticated vote succeeds
  it("TC-VOTE-001: Valid authenticated vote succeeds", async () => {
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-01";
    const clientIp = "192.168.1.100";
    const userId = "authenticated-user-001";

    const result = await pollsService.castVote({
      pollId,
      optionId,
      userId,
      clientIp,
    });

    expect(result.success).toBe(true);
    expect(result.totalVotes).toBeGreaterThan(0);
    const updatedOption = result.options.find((o) => o.id === optionId);
    expect(updatedOption).toBeDefined();
    expect(updatedOption!.votesCount).toBe(1);
  });

  // TC-VOTE-002: Same authenticated user attempts second vote -> ALREADY_VOTED
  it("TC-VOTE-002: Same authenticated user attempts second vote -> ALREADY_VOTED", async () => {
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-01";
    const userId = "fan-user-001";
    const clientIp = "192.168.1.101";

    // First vote succeeds
    const firstVote = await pollsService.castVote({
      pollId,
      optionId,
      userId,
      clientIp,
    });
    expect(firstVote.success).toBe(true);

    // Second vote attempt from same user
    await expect(
      pollsService.castVote({
        pollId,
        optionId: "opt-save-c-02",
        userId,
        clientIp,
      })
    ).rejects.toThrow(ConflictException);

    try {
      await pollsService.castVote({
        pollId,
        optionId: "opt-save-c-02",
        userId,
        clientIp,
      });
    } catch (err: any) {
      expect(err.getResponse().error).toBe("ALREADY_VOTED");
    }
  });

  // TC-VOTE-003: Unauthenticated vote (missing userId) -> Rejected
  it("TC-VOTE-003: Unauthenticated vote (missing userId) -> Rejected", async () => {
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-02";
    const clientIp = "192.168.1.102";

    await expect(
      pollsService.castVote({
        pollId,
        optionId,
        clientIp,
      })
    ).rejects.toThrow(UnauthorizedException);
  });

  // TC-VOTE-004: Inactive poll rejects vote
  it("TC-VOTE-004: Inactive poll rejects vote", async () => {
    const draftPoll = pollsService.createPoll({
      title: "Draft Upcoming Poll",
      options: [{ text: "Option A" }, { text: "Option B" }],
    });
    pollsService.updatePollStatus(draftPoll.id, "DRAFT");

    await expect(
      pollsService.castVote({
        pollId: draftPoll.id,
        optionId: draftPoll.options[0].id,
        userId: "user-004",
        clientIp: "192.168.1.104",
      })
    ).rejects.toThrow(BadRequestException);
  });

  // TC-VOTE-005: Closed poll rejects vote
  it("TC-VOTE-005: Closed poll rejects vote", async () => {
    const closedPoll = pollsService.createPoll({
      title: "Closed Previous Poll",
      options: [{ text: "Option A" }, { text: "Option B" }],
    });
    pollsService.updatePollStatus(closedPoll.id, "CLOSED");

    await expect(
      pollsService.castVote({
        pollId: closedPoll.id,
        optionId: closedPoll.options[0].id,
        userId: "user-005",
        clientIp: "192.168.1.105",
      })
    ).rejects.toThrow(BadRequestException);

    // Also verify eviction poll when closed
    const evictionPoll = db.polls.get("poll-eviction-01")!;
    evictionPoll.status = "CLOSED";
    await expect(
      pollsService.castVote({
        pollId: "poll-eviction-01",
        optionId: evictionPoll.options[0].id,
        userId: "user-005-b",
        clientIp: "192.168.1.105",
      })
    ).rejects.toThrow(BadRequestException);
  });

  // TC-VOTE-006: Invalid option rejects vote
  it("TC-VOTE-006: Invalid option rejects vote", async () => {
    const pollId = "poll-eviction-01";
    const nonExistentOption = "opt-9999-invalid";

    await expect(
      pollsService.castVote({
        pollId,
        optionId: nonExistentOption,
        userId: "user-006",
        clientIp: "192.168.1.106",
      })
    ).rejects.toThrow(BadRequestException);
  });

  // TC-VOTE-007: 10 different authenticated users from SAME IP (Wi-Fi) all succeed
  it("TC-VOTE-007: 10 different authenticated users on same IP all succeed independently", async () => {
    const pollId = "poll-eviction-01";
    const sharedWifiIp = "192.168.1.254";
    const poll = db.polls.get(pollId)!;

    // Pick 10 active options
    const options = poll.options.slice(0, 10);
    expect(options.length).toBe(10);

    for (let i = 0; i < 10; i++) {
      const userResult = await pollsService.castVote({
        pollId,
        optionId: options[i].id,
        userId: `wifi-friend-user-${i + 1}`,
        clientIp: sharedWifiIp,
      });
      expect(userResult.success).toBe(true);
    }

    const updatedPoll = db.polls.get(pollId)!;
    expect(updatedPoll.totalVotes).toBe(10);

    // Each option got 1 vote
    for (let i = 0; i < 10; i++) {
      const opt = updatedPoll.options.find((o) => o.id === options[i].id);
      expect(opt!.votesCount).toBe(1);
      const percentage = (opt!.votesCount / updatedPoll.totalVotes) * 100;
      expect(percentage).toBe(10);
    }
  });

  // TC-VOTE-008: IP reaches configured threshold -> HTTP 429
  it("TC-VOTE-008: IP reaches configured threshold -> HTTP 429", async () => {
    rateLimiter.setMaxVotesPerIp(3);
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-01";
    const clientIp = "10.0.0.99";

    // 3 different users from same public Wi-Fi/IP vote successfully
    for (let i = 1; i <= 3; i++) {
      await pollsService.castVote({
        pollId,
        optionId,
        userId: `user-ip-test-${i}`,
        clientIp,
      });
    }

    // 4th attempt from same IP exceeds threshold
    await expect(
      pollsService.castVote({
        pollId,
        optionId,
        userId: "user-ip-test-4",
        clientIp,
      })
    ).rejects.toThrow(HttpException);

    try {
      await pollsService.castVote({
        pollId,
        optionId,
        userId: "user-ip-test-4",
        clientIp,
      });
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });

  // TC-VOTE-009: 51st request from the same IP is rate limited when threshold is 50
  it("TC-VOTE-009: 51st request from same IP is rate limited when threshold is 50", async () => {
    rateLimiter.setMaxVotesPerIp(50);
    const clientIp = "203.0.113.50";
    const ipHash = rateLimiter.hashIp(clientIp);

    // Simulate 50 votes recorded from this IP in Redis
    for (let i = 0; i < 50; i++) {
      await rateLimiter.incrementVoteCount(ipHash);
    }

    // 51st attempt from this IP must be rejected with 429
    await expect(
      pollsService.castVote({
        pollId: "poll-eviction-01",
        optionId: "opt-save-c-01",
        userId: "user-51",
        clientIp,
      })
    ).rejects.toThrow(HttpException);

    try {
      await pollsService.castVote({
        pollId: "poll-eviction-01",
        optionId: "opt-save-c-01",
        userId: "user-51",
        clientIp,
      });
    } catch (err: any) {
      expect(err.getStatus()).toBe(429);
      expect(err.getResponse().message).toContain("50 votes per 24h window");
    }
  });

  // TC-VOTE-010: Concurrent duplicate requests create only one database vote
  it("TC-VOTE-010: Concurrent duplicate requests create only one database vote", async () => {
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-02";
    const userId = "concurrent-user-test";
    const clientIp = "192.168.1.110";

    const initialTotal = db.polls.get(pollId)!.totalVotes;

    // Fire 5 simultaneous requests with the same user ID
    const promises = Array.from({ length: 5 }).map(() =>
      pollsService.castVote({
        pollId,
        optionId,
        userId,
        clientIp,
      }).catch((e) => e)
    );

    const responses = await Promise.all(promises);
    const successes = responses.filter((r) => r && r.success === true);
    const conflicts = responses.filter((r) => r instanceof ConflictException);

    expect(successes.length).toBe(1);
    expect(conflicts.length).toBe(4);
    expect(db.polls.get(pollId)!.totalVotes).toBe(initialTotal + 1);
  });

  // TC-VOTE-011: Database unique constraint prevents duplicate voting
  it("TC-VOTE-011: Database unique constraint prevents duplicate voting", async () => {
    const pollId = "poll-eviction-01";
    const userId = "unique-constraint-user";
    const ipHash = "ip-hash-test";

    // Direct DB insertion inside transaction
    await db.executeTransaction(async (tx) => {
      tx.insertVote({
        pollId,
        optionId: "opt-save-c-01",
        userId,
        ipHash,
      });
    });

    // Attempting another insert with the same userId and pollId directly into DB
    await expect(
      db.executeTransaction(async (tx) => {
        tx.insertVote({
          pollId,
          optionId: "opt-save-c-02",
          userId,
          ipHash,
        });
      })
    ).rejects.toThrow("Unique constraint violation");
  });

  // TC-VOTE-012: Database failure rolls back transaction
  it("TC-VOTE-012: Database failure rolls back transaction", async () => {
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-03";
    const poll = db.polls.get(pollId)!;
    const option = db.pollOptions.get(optionId)!;

    const initialTotalVotes = poll.totalVotes;
    const initialOptionVotes = option.votesCount;
    const initialVotesSize = db.votes.size;

    await expect(
      db.executeTransaction(async (tx) => {
        tx.insertVote({
          pollId,
          optionId,
          userId: "rollback-test-user",
          ipHash: "ip-hash-test",
        });
        tx.incrementPollVotes(pollId, optionId);

        throw new Error("Simulated database connection failure mid-transaction");
      })
    ).rejects.toThrow("Simulated database connection failure");

    // Verify rollback restored initial state completely
    expect(poll.totalVotes).toBe(initialTotalVotes);
    expect(option.votesCount).toBe(initialOptionVotes);
    expect(db.votes.size).toBe(initialVotesSize);
  });
});

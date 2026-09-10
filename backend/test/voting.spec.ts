import { DatabaseService } from "../src/database/database.service";
import { RedisRateLimiterService } from "../src/redis/redis-rate-limiter.service";
import { PollsService } from "../src/polls/polls.service";
import { BadRequestException, ConflictException, HttpException, HttpStatus } from "@nestjs/common";

describe("Voting System - Section 40 Automated Test Cases", () => {
  let db: DatabaseService;
  let rateLimiter: RedisRateLimiterService;
  let pollsService: PollsService;

  beforeEach(() => {
    db = new DatabaseService();
    db.onModuleInit();
    rateLimiter = new RedisRateLimiterService();
    rateLimiter.setMaxVotesPerIp(50);
    pollsService = new PollsService(db, rateLimiter);
  });

  // TC-VOTE-001: Valid vote succeeds
  it("TC-VOTE-001: Valid vote succeeds", async () => {
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-01";
    const clientIp = "192.168.1.100";
    const voterToken = "voter-uuid-token-001";

    const result = await pollsService.castVote({
      pollId,
      optionId,
      voterToken,
      clientIp,
    });

    expect(result.success).toBe(true);
    expect(result.totalVotes).toBeGreaterThan(0);
    const updatedOption = result.options.find((o) => o.id === optionId);
    expect(updatedOption).toBeDefined();
    expect(updatedOption!.votesCount).toBe(1); // 0 seed + 1
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

  // TC-VOTE-003: Same anonymous voter token attempts second vote -> Rejected
  it("TC-VOTE-003: Same anonymous voter token attempts second vote -> Rejected", async () => {
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-02";
    const voterToken = "unique-device-token-abc";
    const clientIp = "192.168.1.102";

    // First vote succeeds
    await pollsService.castVote({
      pollId,
      optionId,
      voterToken,
      clientIp,
    });

    // Second vote with same voter token
    await expect(
      pollsService.castVote({
        pollId,
        optionId: "opt-save-c-03",
        voterToken,
        clientIp,
      })
    ).rejects.toThrow(ConflictException);
  });

  // TC-VOTE-004: Inactive poll rejects vote
  it("TC-VOTE-004: Inactive poll rejects vote", async () => {
    // Create draft poll
    const draftPoll = pollsService.createPoll({
      title: "Draft Upcoming Poll",
      options: [{ text: "Option A" }, { text: "Option B" }],
    });
    pollsService.updatePollStatus(draftPoll.id, "DRAFT");

    await expect(
      pollsService.castVote({
        pollId: draftPoll.id,
        optionId: draftPoll.options[0].id,
        voterToken: "anon-voter-004",
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
        voterToken: "anon-voter-005",
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
        voterToken: "anon-voter-006",
        clientIp: "192.168.1.106",
      })
    ).rejects.toThrow(BadRequestException);
  });

  // TC-VOTE-007: Malformed request rejects vote
  it("TC-VOTE-007: Malformed request rejects vote (missing voter identity)", async () => {
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-01";

    await expect(
      pollsService.castVote({
        pollId,
        optionId,
        clientIp: "192.168.1.107",
        // Neither userId nor voterToken provided
      })
    ).rejects.toThrow(BadRequestException);
  });

  // TC-VOTE-008: IP reaches configured threshold -> HTTP 429
  it("TC-VOTE-008: IP reaches configured threshold -> HTTP 429", async () => {
    // Set a test threshold of 3 for this test
    rateLimiter.setMaxVotesPerIp(3);
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-01";
    const clientIp = "10.0.0.99";

    // 3 different users from same public Wi-Fi/IP vote successfully
    for (let i = 1; i <= 3; i++) {
      await pollsService.castVote({
        pollId,
        optionId,
        voterToken: `device-token-${i}`,
        clientIp,
      });
    }

    // 4th attempt from same IP exceeds threshold
    await expect(
      pollsService.castVote({
        pollId,
        optionId,
        voterToken: "device-token-4",
        clientIp,
      })
    ).rejects.toThrow(HttpException);

    try {
      await pollsService.castVote({
        pollId,
        optionId,
        voterToken: "device-token-4",
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
        voterToken: "token-user-51",
        clientIp,
      })
    ).rejects.toThrow(HttpException);

    try {
      await pollsService.castVote({
        pollId: "poll-eviction-01",
        optionId: "opt-save-c-01",
        voterToken: "token-user-51",
        clientIp,
      })
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
    const voterTokenHash = "unique-voter-token-hash-12345";
    const ipHash = "ip-hash-test";

    // Direct DB insertion inside transaction
    await db.executeTransaction(async (tx) => {
      tx.insertVote({
        pollId,
        optionId: "opt-save-c-01",
        voterTokenHash,
        ipHash,
      });
    });

    // Attempting another insert with the same voterTokenHash and pollId directly into DB
    await expect(
      db.executeTransaction(async (tx) => {
        tx.insertVote({
          pollId,
          optionId: "opt-save-c-02",
          voterTokenHash,
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

        // Simulate simulated error during transaction
        throw new Error("Simulated database connection failure mid-transaction");
      })
    ).rejects.toThrow("Simulated database connection failure");

    // Verify rollback restored initial state completely
    expect(poll.totalVotes).toBe(initialTotalVotes);
    expect(option.votesCount).toBe(initialOptionVotes);
    expect(db.votes.size).toBe(initialVotesSize);
  });
});

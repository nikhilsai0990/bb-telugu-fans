import { DatabaseService } from "../src/database/database.service";
import { RedisRateLimiterService } from "../src/redis/redis-rate-limiter.service";
import { PollsService } from "../src/polls/polls.service";
import { BadRequestException, ConflictException } from "@nestjs/common";

describe("Season 10 Canonical Game State Tests - Section 15 Acceptance Criteria", () => {
  let db: DatabaseService;
  let rateLimiter: RedisRateLimiterService;
  let pollsService: PollsService;

  beforeEach(() => {
    db = new DatabaseService();
    db.onModuleInit();
    rateLimiter = new RedisRateLimiterService();
    pollsService = new PollsService(db, rateLimiter);
  });

  it("1. Exactly 15 active contestants and 1 eliminated contestant (Charan)", () => {
    const all = Array.from(db.contestants.values());
    expect(all.length).toBe(16);
    const active = all.filter((c) => c.isActive && !c.isEliminated);
    const eliminated = all.filter((c) => c.isEliminated || c.status === "ELIMINATED");
    expect(active.length).toBe(15);
    expect(eliminated.length).toBe(1);
    expect(eliminated[0].name).toBe("Charan");
    expect(eliminated[0].status).toBe("ELIMINATED");
    expect(eliminated[0].isActive).toBe(false);
    expect(eliminated[0].isNominated).toBe(false);
  });

  it("2. Charan is not vote-eligible and cannot receive votes", async () => {
    const poll = db.polls.get("poll-eviction-01")!;
    const charanOption = poll.options.find((opt) => opt.contestantId === "c-13");
    expect(charanOption).toBeUndefined();

    // Even if a malformed option was constructed targeting Charan, castVote rejects it
    const fakeCharanOpt = {
      id: "opt-save-charan-fake",
      pollId: "poll-eviction-01",
      contestantId: "c-13",
      text: "Save Charan",
      votesCount: 0,
    };
    db.pollOptions.set(fakeCharanOpt.id, fakeCharanOpt);
    await expect(
      pollsService.castVote({
        pollId: "poll-eviction-01",
        optionId: fakeCharanOpt.id,
        voterToken: "anon-token-charan-test",
        clientIp: "192.168.1.150",
      })
    ).rejects.toThrow(BadRequestException);
  });

  it("3. Charan is not High Risk Zone", () => {
    const charan = db.contestants.get("c-13")!;
    expect(charan.zone).toBe("NORMAL");
    expect(charan.isHighRiskZone).toBeFalsy();
  });

  it("4. Auto Ram Prasad is High Risk Zone", () => {
    const ramPrasad = db.contestants.get("c-02")!;
    expect(ramPrasad.zone).toBe("HIGH_RISK");
    expect(ramPrasad.isHighRiskZone).toBe(true);
    expect(ramPrasad.isActive).toBe(true);
    expect(ramPrasad.isNominated).toBe(true);
  });

  it("5. Chaitra Rai is High Risk Zone", () => {
    const chaitra = db.contestants.get("c-10")!;
    expect(chaitra.zone).toBe("HIGH_RISK");
    expect(chaitra.isHighRiskZone).toBe(true);
    expect(chaitra.isActive).toBe(true);
    expect(chaitra.isNominated).toBe(true);
  });

  it("6. Exactly 2 High Risk Zone contestants exist", () => {
    const all = Array.from(db.contestants.values());
    const highRisk = all.filter((c) => c.zone === "HIGH_RISK" || c.isHighRiskZone === true);
    expect(highRisk.length).toBe(2);
    const names = highRisk.map((c) => c.name).sort();
    expect(names).toEqual(["Auto Ram Prasad", "Chaitra Rai"].sort());
  });

  it("7. Aman is not High Risk Zone", () => {
    const aman = db.contestants.get("c-12")!;
    expect(aman.zone).toBe("NORMAL");
    expect(aman.isHighRiskZone).toBeFalsy();
  });

  it("8. Mukesh Gowda is not High Risk Zone", () => {
    const mukesh = db.contestants.get("c-05")!;
    expect(mukesh.zone).toBe("NORMAL");
    expect(mukesh.isHighRiskZone).toBeFalsy();
  });

  it("9. Debjani is Blue Team Leader", () => {
    const debjani = db.contestants.get("c-01")!;
    expect(debjani.team).toBe("BLUE");
    expect(debjani.role).toBe("LEADER");
  });

  it("10. Rohit is Red Team Leader", () => {
    const rohit = db.contestants.get("c-11")!;
    expect(rohit.team).toBe("RED");
    expect(rohit.role).toBe("LEADER");
  });

  it("11. Red Team won Task 1 (Rohit Naidu + Temper Vamsi = 1, Thrigun + Mukesh Gowda = 0)", () => {
    const rohit = db.contestants.get("c-11")!;
    const vamsi = db.contestants.get("c-07")!;
    const thrigun = db.contestants.get("c-04")!;
    const mukesh = db.contestants.get("c-05")!;
    expect(rohit.stats.tasksWon).toBe(1);
    expect(vamsi.stats.tasksWon).toBe(1);
    expect(thrigun.stats.tasksWon).toBe(0);
    expect(mukesh.stats.tasksWon).toBe(0);
  });

  it("12. Voting results initially show 0 votes and 0%", () => {
    const poll = db.polls.get("poll-eviction-01")!;
    expect(poll.totalVotes).toBe(0);
    expect(poll.options.length).toBe(15);
    for (const opt of poll.options) {
      expect(opt.votesCount).toBe(0);
    }
  });

  it("13. User cannot vote more than once per day", async () => {
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-01";
    const userId = "test-daily-user-1";
    const clientIp = "192.168.1.200";

    const firstVote = await pollsService.castVote({
      pollId,
      optionId,
      userId,
      clientIp,
    });
    expect(firstVote.success).toBe(true);

    await expect(
      pollsService.castVote({
        pollId,
        optionId: "opt-save-c-02",
        userId,
        clientIp,
      })
    ).rejects.toThrow(ConflictException);
  });

  it("14. Existing vote is detected after refresh", async () => {
    const pollId = "poll-eviction-01";
    const optionId = "opt-save-c-01";
    const voterToken = "device-token-refresh-test";
    const clientIp = "192.168.1.201";

    const initialStatus = pollsService.getVoterStatus({
      pollId,
      voterToken,
    });
    expect(initialStatus.hasVoted).toBe(false);

    await pollsService.castVote({
      pollId,
      optionId,
      voterToken,
      clientIp,
    });

    const refreshedStatus = pollsService.getVoterStatus({
      pollId,
      voterToken,
    });
    expect(refreshedStatus.hasVoted).toBe(true);
    expect(refreshedStatus.optionId).toBe(optionId);
    expect(refreshedStatus.contestantName).toBe("Debjani Modak");
  });

  it("15. Eliminated contestant cannot receive votes", async () => {
    const charan = db.contestants.get("c-13")!;
    expect(charan.status).toBe("ELIMINATED");
    expect(charan.isEliminated).toBe(true);
  });
});

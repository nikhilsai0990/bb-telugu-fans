import { DatabaseService } from "../src/database/database.service";
import { RedisRateLimiterService } from "../src/redis/redis-rate-limiter.service";
import { PollsService } from "../src/polls/polls.service";
import { BadRequestException, ConflictException } from "@nestjs/common";

describe("Season 10 Authoritative Game State Tests", () => {
  let db: DatabaseService;
  let rateLimiter: RedisRateLimiterService;
  let pollsService: PollsService;

  beforeEach(() => {
    db = new DatabaseService();
    db.onModuleInit();
    rateLimiter = new RedisRateLimiterService();
    pollsService = new PollsService(db, rateLimiter);
  });

  it("1. Exactly 14 active housemates and 2 eliminated housemates (Charan & Chaitra Rai)", () => {
    const all = Array.from(db.contestants.values());
    expect(all.length).toBe(16);
    const active = all.filter((c) => c.isActive && !c.isEliminated);
    const eliminated = all.filter((c) => c.isEliminated || c.status === "ELIMINATED");
    expect(active.length).toBe(14);
    expect(eliminated.length).toBe(2);
    
    const eliminatedNames = eliminated.map((c) => c.name).sort();
    expect(eliminatedNames).toEqual(["Chaitra Rai", "Charan"].sort());

    for (const c of eliminated) {
      expect(c.status).toBe("ELIMINATED");
      expect(c.isActive).toBe(false);
      expect(c.isNominated).toBe(false);
      expect(c.noReentry).toBe(true);
      expect(c.reEntryEligible).toBe(false);
    }
  });

  it("2. Charan and Chaitra Rai are not vote-eligible and cannot receive votes", async () => {
    const poll = db.polls.get("poll-eviction-01")!;
    const charanOption = poll.options.find((opt) => opt.contestantId === "c-13");
    const chaitraOption = poll.options.find((opt) => opt.contestantId === "c-10");
    expect(charanOption).toBeUndefined();
    expect(chaitraOption).toBeUndefined();

    // Even if a malformed option was constructed targeting an eliminated contestant on an active poll, castVote rejects it
    poll.status = "ACTIVE";
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
        userId: "user-test-charan",
        clientIp: "192.168.1.150",
      })
    ).rejects.toThrow(BadRequestException);
  });

  it("3. Charan and Chaitra Rai are not High Risk Zone and have No Re-entry", () => {
    const charan = db.contestants.get("c-13")!;
    const chaitra = db.contestants.get("c-10")!;
    expect(charan.zone).toBe("NORMAL");
    expect(charan.isHighRiskZone).toBeFalsy();
    expect(charan.noReentry).toBe(true);
    expect(chaitra.zone).toBe("NORMAL");
    expect(chaitra.isHighRiskZone).toBeFalsy();
    expect(chaitra.noReentry).toBe(true);
  });

  it("4. Aman is High Risk Zone (Active housemate)", () => {
    const aman = db.contestants.get("c-12")!;
    expect(aman.zone).toBe("HIGH_RISK");
    expect(aman.isHighRiskZone).toBe(true);
    expect(aman.isActive).toBe(true);
    expect(aman.isNominated).toBe(false);
    expect(aman.isEliminated).toBe(false);
  });

  it("5. Sudheer Kumar Reddy is High Risk Zone (Active housemate)", () => {
    const sudheer = db.contestants.get("c-09")!;
    expect(sudheer.zone).toBe("HIGH_RISK");
    expect(sudheer.isHighRiskZone).toBe(true);
    expect(sudheer.isActive).toBe(true);
    expect(sudheer.isNominated).toBe(false);
    expect(sudheer.isEliminated).toBe(false);
  });

  it("6. Varshini Sounderajan is High Risk Zone (Active housemate)", () => {
    const varshini = db.contestants.get("c-06")!;
    expect(varshini.zone).toBe("HIGH_RISK");
    expect(varshini.isHighRiskZone).toBe(true);
    expect(varshini.isActive).toBe(true);
    expect(varshini.isNominated).toBe(false);
    expect(varshini.isEliminated).toBe(false);
  });

  it("7. Exactly 3 High Risk Zone contestants exist (Aman, Sudheer Kumar Reddy, Varshini Sounderajan)", () => {
    const all = Array.from(db.contestants.values());
    const highRisk = all.filter((c) => c.zone === "HIGH_RISK" || c.isHighRiskZone === true);
    expect(highRisk.length).toBe(3);
    const names = highRisk.map((c) => c.name).sort();
    expect(names).toEqual(["Aman", "Sudheer Kumar Reddy", "Varshini Sounderajan"].sort());
  });

  it("8. Auto Ram Prasad is NOT High Risk Zone, is TASK WINNER, and is a Housemate", () => {
    const ramPrasad = db.contestants.get("c-02")!;
    expect(ramPrasad.zone).toBe("NORMAL");
    expect(ramPrasad.isHighRiskZone).toBeFalsy();
    expect(ramPrasad.stats.tasksWon).toBe(1);
    expect(ramPrasad.isTaskWinner).toBe(true);
    expect(ramPrasad.taskTitle).toBe("TASK WINNER");
    expect(ramPrasad.isHousemate).toBe(true);
    expect(ramPrasad.isActive).toBe(true);
    expect(ramPrasad.isNominated).toBe(false);
  });

  it("9. Mukesh Gowda is not High Risk Zone", () => {
    const mukesh = db.contestants.get("c-05")!;
    expect(mukesh.zone).toBe("NORMAL");
    expect(mukesh.isHighRiskZone).toBeFalsy();
  });

  it("10. All 16 participants are Housemates with unified terminology", () => {
    const all = Array.from(db.contestants.values());
    expect(all.length).toBe(16);
    const housemates = all.filter((c) => c.isHousemate);
    expect(housemates.length).toBe(16);
  });

  it("11. Task Winners are Auto Ram Prasad, Rohit Naidu, and Temper Vamsi (TASK WINNER label)", () => {
    const all = Array.from(db.contestants.values());
    const taskWinners = all.filter((c) => c.isTaskWinner);
    expect(taskWinners.length).toBe(3);
    const names = taskWinners.map((c) => c.name).sort();
    expect(names).toEqual(["Auto Ram Prasad", "Rohit Naidu", "Temper Vamsi"].sort());
    for (const tw of taskWinners) {
      expect(tw.taskTitle).toBe("TASK WINNER");
      expect(tw.stats.tasksWon).toBe(1);
    }
  });

  it("12. Team Leaders removed: Debjani Modak and Rohit Naidu are regular housemates (role: PLAYER)", () => {
    const all = Array.from(db.contestants.values());
    const leaders = all.filter((c) => c.role === "LEADER");
    expect(leaders.length).toBe(0);

    const debjani = db.contestants.get("c-01")!;
    const rohit = db.contestants.get("c-11")!;
    expect(debjani.role).toBe("PLAYER");
    expect(rohit.role).toBe("PLAYER");
  });

  it("12b. Nominated status removed: 0 housemates are nominated", () => {
    const all = Array.from(db.contestants.values());
    const nominated = all.filter((c) => c.isNominated);
    expect(nominated.length).toBe(0);
  });

  it("12c. Commoner housemate profiles have exact descriptions", () => {
    expect(db.contestants.get("c-11")?.occupation).toBe("Product Manager • Commoner");
    expect(db.contestants.get("c-12")?.occupation).toBe("Short Film Actor • Commoner");
    expect(db.contestants.get("c-14")?.occupation).toBe("Commoner");
    expect(db.contestants.get("c-15")?.occupation).toBe("Commoner");
    expect(db.contestants.get("c-16")?.occupation).toBe("Singer • Commoner");
  });

  it("13. Sunday voting poll is CLOSED and rejects vote casting", async () => {
    const poll = db.polls.get("poll-eviction-01")!;
    expect(poll.status).toBe("CLOSED");

    await expect(
      pollsService.castVote({
        pollId: "poll-eviction-01",
        optionId: poll.options[0].id,
        userId: "sunday-vote-attempt-user",
        clientIp: "192.168.1.100",
      })
    ).rejects.toThrow(BadRequestException);
  });

  it("14. Voting poll has exactly 14 options (Charan & Chaitra Rai excluded)", () => {
    const poll = db.polls.get("poll-eviction-01")!;
    expect(poll.options.length).toBe(14);
    for (const opt of poll.options) {
      expect(opt.contestantId).not.toBe("c-13");
      expect(opt.contestantId).not.toBe("c-10");
    }
  });

  it("15. Latest News contains the 5 official stories", () => {
    const news = Array.from(db.news.values());
    expect(news.length).toBe(5);
    const titles = news.map((n) => n.title);
    expect(titles.some((t) => t.includes("No Elimination on Sunday"))).toBe(true);
    expect(titles.some((t) => t.includes("Srushti Vyakaranam lost the Power Key"))).toBe(true);
    expect(titles.some((t) => t.includes("Sudheer Kumar Reddy won"))).toBe(true);
    expect(titles.some((t) => t.includes("Krishnudu's team won the task"))).toBe(true);
    expect(titles.some((t) => t.includes("No re-entry for Chaitra Rai and Charan"))).toBe(true);
  });

  it("16. User cannot vote more than once per day when poll is active", async () => {
    const poll = db.polls.get("poll-eviction-01")!;
    poll.status = "ACTIVE";
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
});

import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService, Contestant } from "../database/database.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class ContestantsService {
  constructor(private readonly db: DatabaseService) {}

  public getAllContestants(status?: string, search?: string, team?: string) {
    let list = Array.from(this.db.contestants.values());

    if (status && status !== "ALL") {
      if (status.toUpperCase() === "ACTIVE") {
        list = list.filter((c) => !c.isEliminated && c.status !== "ELIMINATED" && c.status !== "EVICTED");
      } else if (status.toUpperCase() === "ELIMINATED") {
        list = list.filter((c) => c.isEliminated || c.status === "ELIMINATED");
      } else if (
        status.toUpperCase() === "HIGH_RISK" ||
        status.toUpperCase() === "HIGH_RISK_ZONE" ||
        status.toUpperCase() === "HIGH RISK ZONE" ||
        status.toUpperCase() === "HIGH_ZONE" ||
        status.toUpperCase() === "HIGH ZONE"
      ) {
        list = list.filter((c) => (c.zone === "HIGH_RISK" || c.isHighRiskZone || c.slug === "chaitra-rai" || c.slug === "auto-ram-prasad") && c.slug !== "charan" && c.slug !== "aman" && c.slug !== "mukesh-gowda");
      } else if (status.toUpperCase() === "NOMINATED") {
        list = list.filter((c) => c.isNominated || c.status === "NOMINATED");
      } else {
        list = list.filter((c) => c.status.toLowerCase() === status.toLowerCase());
      }
    }

    if (team && team !== "ALL") {
      list = list.filter((c) => c.team?.toUpperCase() === team.toUpperCase());
    }

    if (search && search.trim() !== "") {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.occupation.toLowerCase().includes(q));
    }

    // Sort by popularity score descending
    return list.sort((a, b) => b.popularityScore - a.popularityScore);
  }

  public getPopularityRankings() {
    const list = Array.from(this.db.contestants.values())
      .filter((c) => c.status !== "EVICTED" && c.status !== "ELIMINATED" && !c.isEliminated)
      .sort((a, b) => b.popularityScore - a.popularityScore);

    return list.map((c, index) => ({
      rank: index + 1,
      id: c.id,
      name: c.name,
      slug: c.slug,
      avatarUrl: c.avatarUrl,
      status: c.status,
      team: c.team,
      popularity: c.popularityScore,
      trend: c.trend,
      occupation: c.occupation,
    }));
  }

  public getContestantById(idOrSlug: string): Contestant {
    let contestant = this.db.contestants.get(idOrSlug);
    if (!contestant) {
      for (const c of this.db.contestants.values()) {
        if (c.slug === idOrSlug) {
          contestant = c;
          break;
        }
      }
    }

    if (!contestant) {
      throw new NotFoundException("Contestant not found");
    }

    return contestant;
  }

  public createContestant(data: Partial<Contestant>): Contestant {
    const id = uuidv4();
    const slug = data.name ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : id;
    const contestant: Contestant = {
      id,
      name: data.name || "Unknown",
      slug,
      season: data.season || 10,
      team: data.team || "RED",
      role: data.role || "PLAYER",
      isActive: data.isActive !== undefined ? data.isActive : true,
      isNominated: data.isNominated !== undefined ? data.isNominated : true,
      taskStatus: data.taskStatus,
      avatarUrl: data.avatarUrl || "/images/contestants/debjani-modak.webp",
      bannerUrl: data.bannerUrl,
      bio: data.bio || "",
      occupation: data.occupation || "Contestant",
      status: data.status || "NOMINATED",
      popularityScore: data.popularityScore !== undefined ? data.popularityScore : 0,
      trend: data.trend || "STABLE",
      weekNumber: data.weekNumber || 1,
      stats: data.stats || {
        tasksWon: 0,
        nominationsFaced: 1,
        timesCaptain: 0,
        fanSentimentPositive: 0,
        fanSentimentNeutral: 0,
        fanSentimentNegative: 0,
      },
      createdAt: new Date(),
    };

    this.db.contestants.set(contestant.id, contestant);
    return contestant;
  }

  public updateContestant(id: string, data: Partial<Contestant>): Contestant {
    const contestant = this.getContestantById(id);
    const updated: Contestant = {
      ...contestant,
      ...data,
      stats: {
        ...contestant.stats,
        ...(data.stats || {}),
      },
    };
    this.db.contestants.set(contestant.id, updated);
    return updated;
  }
}

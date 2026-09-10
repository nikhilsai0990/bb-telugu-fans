import { Controller, Get, Param, Query } from "@nestjs/common";
import { ContestantsService } from "./contestants.service";

@Controller("contestants")
export class ContestantsController {
  constructor(private readonly contestantsService: ContestantsService) {}

  @Get()
  getAll(
    @Query("status") status?: string,
    @Query("search") search?: string,
    @Query("team") team?: string,
  ) {
    return this.contestantsService.getAllContestants(status, search, team);
  }

  @Get("rankings")
  getRankings() {
    return this.contestantsService.getPopularityRankings();
  }

  @Get(":id")
  getById(@Param("id") id: string) {
    return this.contestantsService.getContestantById(id);
  }
}

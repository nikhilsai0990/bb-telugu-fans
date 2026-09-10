import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { PollsModule } from "../polls/polls.module";
import { ContestantsModule } from "../contestants/contestants.module";
import { NewsModule } from "../news/news.module";

@Module({
  imports: [PollsModule, ContestantsModule, NewsModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}

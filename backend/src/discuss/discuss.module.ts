import { Module } from "@nestjs/common";
import { DiscussService } from "./discuss.service";
import { DiscussController } from "./discuss.controller";

@Module({
  controllers: [DiscussController],
  providers: [DiscussService],
  exports: [DiscussService],
})
export class DiscussModule {}

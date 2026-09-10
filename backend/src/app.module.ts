import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { RedisModule } from "./redis/redis.module";
import { AuthModule } from "./auth/auth.module";
import { PollsModule } from "./polls/polls.module";
import { ContestantsModule } from "./contestants/contestants.module";
import { NewsModule } from "./news/news.module";
import { MemesModule } from "./memes/memes.module";
import { DiscussModule } from "./discuss/discuss.module";
import { ModerationModule } from "./moderation/moderation.module";
import { AdminModule } from "./admin/admin.module";

@Module({
  imports: [
    DatabaseModule,
    RedisModule,
    AuthModule,
    PollsModule,
    ContestantsModule,
    NewsModule,
    MemesModule,
    DiscussModule,
    ModerationModule,
    AdminModule,
  ],
})
export class AppModule {}

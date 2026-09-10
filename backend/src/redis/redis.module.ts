import { Module, Global } from "@nestjs/common";
import { RedisRateLimiterService } from "./redis-rate-limiter.service";

@Global()
@Module({
  providers: [RedisRateLimiterService],
  exports: [RedisRateLimiterService],
})
export class RedisModule {}

import { Controller, Get, Param, Query } from "@nestjs/common";
import { NewsService } from "./news.service";

@Controller("news")
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  getAll(@Query("category") category?: string, @Query("trending") trending?: string) {
    const isTrending = trending === "true" || trending === "1";
    return this.newsService.getAll(category, isTrending);
  }

  @Get(":slug")
  getBySlug(@Param("slug") slug: string) {
    return this.newsService.getBySlug(slug);
  }
}

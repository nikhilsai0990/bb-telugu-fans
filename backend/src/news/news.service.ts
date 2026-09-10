import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService, NewsItem } from "../database/database.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class NewsService {
  constructor(private readonly db: DatabaseService) {}

  public getAll(category?: string, trending?: boolean) {
    let list = Array.from(this.db.news.values()).filter((n) => n.isPublished);

    if (category && category !== "All") {
      list = list.filter((n) => n.category.toLowerCase() === category.toLowerCase());
    }

    if (trending) {
      list = list.filter((n) => n.isTrending);
    }

    return list.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  }

  public getBySlug(slug: string): NewsItem {
    let item: NewsItem | undefined;
    for (const n of this.db.news.values()) {
      if (n.slug === slug || n.id === slug) {
        item = n;
        break;
      }
    }

    if (!item) {
      throw new NotFoundException("Article not found");
    }

    // Increment view count
    item.viewsCount += 1;
    return item;
  }

  public create(data: Partial<NewsItem>): NewsItem {
    const id = uuidv4();
    const slug = data.slug || data.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || id;

    const item: NewsItem = {
      id,
      title: data.title || "Untitled",
      slug,
      summary: data.summary || "",
      content: data.content || "",
      category: data.category || "House Gossips",
      imageUrl: data.imageUrl || "/images/logo-bb10.webp",
      viewsCount: 0,
      isTrending: !!data.isTrending,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      publishedAt: new Date(),
      createdAt: new Date(),
    };

    this.db.news.set(item.id, item);
    return item;
  }
}

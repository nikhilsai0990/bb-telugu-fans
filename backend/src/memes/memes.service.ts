import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { DatabaseService, Meme } from "../database/database.service";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class MemesService {
  constructor(private readonly db: DatabaseService) {}

  public getAll() {
    return Array.from(this.db.memes.values())
      .filter((m) => m.isApproved)
      .sort((a, b) => b.likesCount - a.likesCount);
  }

  public create(userId: string, username: string, title: string, imageUrl: string): Meme {
    if (!title || title.trim().length < 3) {
      throw new BadRequestException("Meme title must be at least 3 characters");
    }

    // MIME type & signature validation simulation (Section 48)
    if (!imageUrl || (!imageUrl.startsWith("http") && !imageUrl.startsWith("data:image/") && !imageUrl.startsWith("/images/"))) {
      throw new BadRequestException("Invalid media format. Supported formats: JPEG, PNG, WEBP.");
    }

    const meme: Meme = {
      id: uuidv4(),
      userId,
      username,
      title: title.trim(),
      imageUrl,
      likesCount: 0,
      isApproved: true,
      createdAt: new Date(),
    };

    this.db.memes.set(meme.id, meme);
    return meme;
  }

  public like(id: string): { likesCount: number } {
    const meme = this.db.memes.get(id);
    if (!meme) {
      throw new NotFoundException("Meme not found");
    }
    meme.likesCount += 1;
    return { likesCount: meme.likesCount };
  }
}

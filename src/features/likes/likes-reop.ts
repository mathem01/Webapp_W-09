import { and, count, eq } from "drizzle-orm";
import { type DB, db } from "@/db";
import { likes } from "@/db/schema";
import { executeDbOperation, type Result } from "@/lib/result";

export interface LikeRepository {
  hasLiked(userId: string, drawingId: string): Promise<Result<boolean>>;
  addLike(userId: string, drawingId: string): Promise<Result<void>>;
  removeLike(userId: string, drawingId: string): Promise<Result<void>>;
  countLikes(drawingId: string): Promise<Result<number>>;
}

export function createLikeRepository(_db: DB): LikeRepository {
  return {
        async hasLiked(userId, drawingId) {
      return executeDbOperation(async () => {
        const [row] = await _db
          .select()
          .from(likes)
          .where(and(eq(likes.userId, userId), eq(likes.drawingId, drawingId)))
          .limit(1);
        return row !== undefined;
      });
    },

    async addLike(userId, drawingId) {
      return executeDbOperation(async () => {
        await _db.insert(likes).values({ userId, drawingId }).onConflictDoNothing();
      });
    },

    async removeLike(userId, drawingId) {
      return executeDbOperation(async () => {
        await _db.delete(likes).where(and(eq(likes.userId, userId), eq(likes.drawingId, drawingId)));
      });
    },

    async countLikes(drawingId) {
      return executeDbOperation(async () => {
        const [row] = await _db.select({ total: count() }).from(likes).where(eq(likes.drawingId, drawingId));
        return row?.total ?? 0;
      });
    },
  };
}

export const likeRepository = createLikeRepository(db);
import { type DB, db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PublicUser } from "./user-types";
import { executeDbOperation, type Result } from "@/lib/result";

export interface UserRepository {
  findByUsername(username: string): Promise<Result<PublicUser | null>>;
}

export function createUserRepository(_db: DB) {
  return {
    async findByUsername(username: string) {
        return executeDbOperation(async () => {
            const [result] = await _db
                .select({
                    id: user.id,
                    name: user.name,
                    username: user.username,
                    image: user.image,
                    createdAt: user.createdAt,
                })
                .from(user)
                .where(eq(user.username, username))
                .limit(1)

            return result ?? null
        })
        // try {
        //     const [result] = await _db
        //         .select({
        //             id: user.id,
        //             name: user.name,
        //             username: user.username,
        //             image: user.image,
        //             createdAt: user.createdAt,
        //         })
        //         .from(user)
        //         .where(eq(user.username, username))
        //         .limit(1)

        //     return {
        //         ok: true,
        //         data: result ?? null,
        //     }

        // } catch (error) {
        //     console.error(error)

        //     return {
        //         ok: false,
        //         error: {
        //             code: "500",
        //             message: "Noe gikk galt med uthentingen",
        //             fieldErrors: {},
        //         }
        //     }
        // }
      
    },
  };
}

export const repository = createUserRepository(db);
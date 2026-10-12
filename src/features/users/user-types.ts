import { user } from "@/db/schema";

export type PublicUser = Pick<
    typeof user.$inferSelect,
    "id" | "name" | "username" | "image" | "createdAt"
>
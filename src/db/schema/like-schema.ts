import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema";
import { drawings } from "./drawing-schema";

export const likes = sqliteTable(
  "likes",
  {
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    drawingId: text("drawing_id").notNull().references(() => drawings.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$default(() => new Date()),
  },
  (table) => [primaryKey({ columns: [table.userId, table.drawingId] })]
);
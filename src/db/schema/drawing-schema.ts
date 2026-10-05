import { index, integer, sqliteTable, text, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { users } from "./user-schema";
import { createId } from "@/lib/id";


/**
 * Tegninger laget av brukerne.
 *
 * Pikslene lagres som JSON-tekst i `pixels`. Antall piksler skal alltid være
 * width * height, og det valideres på serveren før lagring.
 *
 * `remixOfId` peker på tegningen denne er remikset fra, og er tom ellers.
 * "set null" betyr at remiksen består hvis originalen slettes, men mister
 * referansen.
 *
 * TODO: userId skal få .references(() => user.id, { onDelete: "cascade" })
 * når better-auth-tabellene er merget inn.
 */
export const drawings = sqliteTable(
  "drawings",
  {
    id: text("id")
      .primaryKey()
      .$default(() => createId()),

    // Tekst, ikke tall: better-auth bruker tekst-id-er.
    // Fremmednøkkel legges til når brukertabellen finnes.  
    userId: text("user_id").notNull(),
    title: text("title").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),

    //Pikslene som JSON-tekst
    pixels: text("pixels").notNull(),
    isPublic: integer("is_public", { mode: "boolean" })
      .notNull()
      .default(false),

    allowRemix: integer("allow_remix", { mode: "boolean" })
      .notNull()
      .default(true),

    //Peker på en annen rad i denne tabelen. Tom hvis tegningen ikke er en remiks.
    remixOfId: text("remix_of_id").references(
      (): AnySQLiteColumn => drawings.id,
      { onDelete: "set null" }
    ),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$default(() => new Date()),
  },
  (table) => [
    index("idx_drawings_user_id").on(table.userId),
    index("idx_drawings_remix_of_id").on(table.remixOfId),
  ]
);

export type Drawing = typeof drawings.$inferSelect;
export type CreateDrawing = typeof drawings.$inferInsert;






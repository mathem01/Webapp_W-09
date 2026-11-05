import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { relations } from "@/db/relations";
import type { DB } from "@/db";

const MIGRATIONS_DIR = join(process.cwd(), "drizzle", "migrations");

/**
 * En tom database i minnet, bygget av de ekte migreringsfilene. Da tester vi
 * mot samme skjema som appen faktisk bruker, og testen fanger opp hvis en
 * migrering er ødelagt.
 */
export function createTestDb(): DB {
  const sqlite = new Database(":memory:");

  // SQLite har fremmednøkler AV som standard. Uten denne ville en tegning
  // kunne peke på en bruker som ikke finnes, også i testen.
  sqlite.pragma("foreign_keys = ON");

  for (const dir of readdirSync(MIGRATIONS_DIR).sort()) {
    const sql = readFileSync(join(MIGRATIONS_DIR, dir, "migration.sql"), "utf8");

    for (const statement of sql.split("--> statement-breakpoint")) {
      const trimmed = statement.trim();
      
      if (trimmed) sqlite.exec(trimmed);
    }
  }

  return drizzle({ client: sqlite, relations });
}
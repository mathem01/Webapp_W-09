import { describe, it, expect, beforeEach } from "vitest";

import { user } from "@/db/schema";
import { createTestDb } from "@/test/db";
import type { DB } from "@/db";
import {
  createDrawing,
  updateDrawing,
  deleteDrawing,
} from "@/features/drawings/drawing-service";

const ALICE = "user-alice";
const BOB = "user-bob";

let db: DB;

function drawing(overrides = {}) {
  return {
    title: "Min tegning",
    width: 10,
    height: 10,
    pixels: Array(100).fill("#ffffff"),
    ...overrides,
  };
}

// Fersk database og to brukere før hver test, så testene ikke påvirker
// hverandre.
beforeEach(async () => {
  db = createTestDb();
  await db.insert(user).values([
    { id: ALICE, name: "Alice", username: "alice", email: "alice@example.com" },
    { id: BOB, name: "Bob", username: "bob", email: "bob@example.com" },
  ]);
});

describe("hovedflyt", () => {
  it("lager en tegning og finner den igjen", async () => {
    const created = await createDrawing(db, ALICE, drawing());
    expect(created.ok).toBe(true);
    if (!created.ok) return;

    const row = await db.query.drawings.findFirst({
      where: { id: created.data.id },
    });
    expect(row?.userId).toBe(ALICE);
    expect(row?.title).toBe("Min tegning");
  });

  it("er privat som standard", async () => {
    const created = await createDrawing(db, ALICE, drawing());
    if (!created.ok) throw new Error("kunne ikke lage tegning");

    const row = await db.query.drawings.findFirst({
      where: { id: created.data.id },
    });
    expect(row?.isPublic).toBe(false);
  });
});

describe("autorisasjon", () => {
  it("Bob kan ikke endre Alice sin tegning", async () => {
    const created = await createDrawing(db, ALICE, drawing());
    if (!created.ok) throw new Error("kunne ikke lage tegning");

    const result = await updateDrawing(
      db,
      BOB,
      created.data.id,
      drawing({ title: "Hacket" })
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.status).toBe(403);

    // Og tittelen er faktisk uendret i databasen.
    const row = await db.query.drawings.findFirst({
      where: { id: created.data.id },
    });
    expect(row?.title).toBe("Min tegning");
  });

  it("Bob kan ikke slette Alice sin tegning", async () => {
    const created = await createDrawing(db, ALICE, drawing());
    if (!created.ok) throw new Error("kunne ikke lage tegning");

    const result = await deleteDrawing(db, BOB, created.data.id);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(403);

    const row = await db.query.drawings.findFirst({
      where: { id: created.data.id },
    });
    expect(row).toBeTruthy();
  });

  it("Alice kan endre sin egen", async () => {
    const created = await createDrawing(db, ALICE, drawing());
    if (!created.ok) throw new Error("kunne ikke lage tegning");

    const result = await updateDrawing(
      db,
      ALICE,
      created.data.id,
      drawing({ title: "Nytt navn" })
    );
    expect(result.ok).toBe(true);

    const row = await db.query.drawings.findFirst({
      where: { id: created.data.id },
    });
    expect(row?.title).toBe("Nytt navn");
  });

  it("admin kan slette andres tegning", async () => {
    const created = await createDrawing(db, ALICE, drawing());
    if (!created.ok) throw new Error("kunne ikke lage tegning");

    const result = await deleteDrawing(db, BOB, created.data.id, true);
    expect(result.ok).toBe(true);

    const row = await db.query.drawings.findFirst({
      where: { id: created.data.id },
    });
    expect(row).toBeFalsy();
  });

  it("gir 404 for en tegning som ikke finnes", async () => {
    const result = await deleteDrawing(db, ALICE, "finnes-ikke");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(404);
  });
  it("avviser ugyldige data ved oppdatering med 400", async () => {
    const created = await createDrawing(db, ALICE, drawing());
    if (!created.ok) throw new Error("kunne ikke lage tegning");

    const result = await updateDrawing(
      db,
      ALICE,
      created.data.id,
      drawing({ title: "" })
    );

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });
});

describe("validering gjennom servicen", () => {
  it("avviser ugyldige data med 400", async () => {
    const result = await createDrawing(db, ALICE, drawing({ title: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it("lagrer ingenting når data er ugyldige", async () => {
    await createDrawing(db, ALICE, drawing({ width: 9999 }));

    const rows = await db.query.drawings.findMany();
    expect(rows).toHaveLength(0);
  });
});
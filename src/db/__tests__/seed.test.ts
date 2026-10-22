import { it, expect } from "vitest";
import { createTestDb } from "@/test/db";
import { seedInto } from "@/db/seed-data";
import { listPublicDrawings, listUserDrawings } from "@/lib/drawing-service";

it("legger inn alle brukerne og tegningene uten valideringsfeil", async () => {
  const db = createTestDb();
  const counts = await seedInto(db);
  expect(counts).toEqual({ users: 3, drawings: 8 });
});

it("feeden får de sju publiserte, ikke utkastet", async () => {
  const db = createTestDb();
  await seedInto(db);
  const r = await listPublicDrawings(db);
  if (!r.ok) throw new Error("ok");
  expect(r.data).toHaveLength(7);
  expect(r.data.map((d) => d.title)).not.toContain("Utkast, ikke publisert");
});

it("eieren ser utkastet sitt, en gjest gjør ikke", async () => {
  const db = createTestDb();
  await seedInto(db);
  const eier = await listUserDrawings(db, "seed-alice", "seed-alice");
  const gjest = await listUserDrawings(db, "seed-alice", null);
  if (!eier.ok || !gjest.ok) throw new Error("ok");
  expect(eier.data).toHaveLength(3);
  expect(gjest.data).toHaveLength(2);
});

it("hver tegning har like mange piksler som bredde ganger høyde", async () => {
  const db = createTestDb();
  await seedInto(db);
  const r = await listPublicDrawings(db);
  if (!r.ok) throw new Error("ok");
  for (const d of r.data) {
    expect(d.pixels).toHaveLength(d.width * d.height);
  }
});

it("kan kjøres to ganger uten å doble dataene", async () => {
  const db = createTestDb();
  await seedInto(db);
  await seedInto(db);
  const r = await listPublicDrawings(db);
  if (!r.ok) throw new Error("ok");
  expect(r.data).toHaveLength(7);
});
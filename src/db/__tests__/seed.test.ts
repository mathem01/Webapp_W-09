import { it, expect } from "vitest";
import { createTestDb } from "@/test/db";
import { seedInto } from "@/db/seed-data";
import { createDrawingRepository } from "@/features/drawings/drawing-repository";
import { createDrawingService } from "@/features/drawings/drawing-service";
import type { DB } from "@/db";

/* Bygger service mot en database i minnet, uten den ekte D1-klienten. */
function serviceFor(db: DB) {
  return createDrawingService(createDrawingRepository(db));
}

it("legger inn alle brukerne og tegningene uten valideringsfeil", async () => {
  const db = createTestDb();
  const counts = await seedInto(db);
  expect(counts).toEqual({ users: 3, drawings: 8 });
});

it("feeden får de sju publiserte, ikke utkastet", async () => {
  const db = createTestDb();
  await seedInto(db);

  const r = await serviceFor(db).listPublicDrawings(20);
  if (!r.ok) throw new Error("skulle vært ok");

  expect(r.data).toHaveLength(7);
  expect(r.data.map((d) => d.title)).not.toContain("Utkast, ikke publisert");
});

it("eieren ser utkastet sitt, andre gjør ikke", async () => {
  const db = createTestDb();
  await seedInto(db);
  const service = serviceFor(db);

  const eier = await service.listAllDrawingsByUser("seed-alice");
  const andre = await service.listPublicDrawingsByUser("seed-alice");
  if (!eier.ok || !andre.ok) throw new Error("skulle vært ok");

  expect(eier.data).toHaveLength(3);
  expect(andre.data).toHaveLength(2);
});

it("hver tegning har like mange piksler som bredde ganger høyde", async () => {
  const db = createTestDb();
  await seedInto(db);

  const r = await serviceFor(db).listPublicDrawings(20);
  if (!r.ok) throw new Error("skulle vært ok");

  for (const d of r.data) {
    expect(d.pixels).toHaveLength(d.width * d.height);
  }
});

it("kan kjøres to ganger uten å doble dataene", async () => {
  const db = createTestDb();
  await seedInto(db);
  await seedInto(db);

  const r = await serviceFor(db).listPublicDrawings(20);
  if (!r.ok) throw new Error("skulle vært ok");

  expect(r.data).toHaveLength(7);
});
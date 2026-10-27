import { beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { user, drawings } from "@/db/schema";
import { createTestDb } from "@/test/db";
import type { DB } from "@/db";
import {
  createDrawingService,
  type DrawingService,
} from "../drawing-service";
import { createDrawingRepository } from "../drawing-repository";

const ALICE = "user-alice";
const BOB = "user-bob";

let db: DB;
let service: DrawingService;

function drawing(overrides = {}) {
  return {
    title: "Min tegning",
    width: 10,
    height: 10,
    pixels: Array(100).fill("#ffffff"),
    ...overrides,
  };
}

async function findDrawing(id: string) {
  const [row] = await db
    .select()
    .from(drawings)
    .where(eq(drawings.id, id))
    .limit(1);

  return row;
}

beforeEach(async () => {
  db = createTestDb();

  await db.insert(user).values([
    {
      id: ALICE,
      name: "Alice",
      username: "alice",
      email: "alice@example.com",
    },
    {
      id: BOB,
      name: "Bob",
      username: "bob",
      email: "bob@example.com",
    },
  ]);

  service = createDrawingService(
    createDrawingRepository(db)
  );
});

describe("drawingService.createDrawing", () => {
  it("lager en tegning og lagrer riktig eier", async () => {
    const result = await service.createDrawing(ALICE, drawing());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const row = await findDrawing(result.data.id);

    expect(row?.userId).toBe(ALICE);
    expect(row?.title).toBe("Min tegning");
  });

  it("oppretter private tegninger som standard", async () => {
    const result = await service.createDrawing(ALICE, drawing());

    if (!result.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const row = await findDrawing(result.data.id);

    expect(row?.isPublic).toBe(false);
  });

  it("avviser ugyldige data", async () => {
    const result = await service.createDrawing(
      ALICE,
      drawing({ title: "" })
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("BAD_REQUEST");
      expect(result.error.fieldErrors?.title).toBeDefined();
    }
  });

  it("lagrer ingenting når data er ugyldige", async () => {
    const result = await service.createDrawing(
      ALICE,
      drawing({ width: 9999 })
    );

    expect(result.ok).toBe(false);

    const rows = await db
      .select()
      .from(drawings);

    expect(rows).toHaveLength(0);
  });
});

describe("drawingService.getDrawing", () => {
  it("lar eieren hente sin private tegning", async () => {
    const created = await service.createDrawing(ALICE, drawing());

    if (!created.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const result = await service.getDrawing(created.data.id, ALICE);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.title).toBe("Min tegning");
    }
  });

  it("skjuler private tegninger for andre brukere", async () => {
    const created = await service.createDrawing(ALICE, drawing());

    if (!created.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const result = await service.getDrawing(created.data.id, BOB);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });

  it("skjuler private tegninger for gjester", async () => {
    const created = await service.createDrawing(ALICE, drawing());

    if (!created.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const result = await service.getDrawing(created.data.id, null);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });

  it("lar gjester hente offentlige tegninger", async () => {
    const created = await service.createDrawing(ALICE, drawing());

    if (!created.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const visibility = await service.setDrawingVisibility(
      created.data.id,
      ALICE,
      true
    );

    expect(visibility.ok).toBe(true);

    const result = await service.getDrawing(created.data.id, null);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.title).toBe("Min tegning");
    }
  });

  it("returnerer NOT_FOUND for en ukjent tegning", async () => {
    const result = await service.getDrawing("finnes-ikke", ALICE);

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });
});

describe("drawingService.updateDrawing", () => {
  it("lar Alice oppdatere sin egen tegning", async () => {
    const created = await service.createDrawing(ALICE, drawing());

    if (!created.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const result = await service.updateDrawing(
      created.data.id,
      ALICE,
      drawing({ title: "Nytt navn" })
    );

    expect(result.ok).toBe(true);

    const row = await findDrawing(created.data.id);

    expect(row?.title).toBe("Nytt navn");
  });

  it("hindrer Bob i å oppdatere Alice sin tegning", async () => {
    const created = await service.createDrawing(ALICE, drawing());

    if (!created.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const result = await service.updateDrawing(
      created.data.id,
      BOB,
      drawing({ title: "Hacket" })
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }

    const row = await findDrawing(created.data.id);

    expect(row?.title).toBe("Min tegning");
  });

  it("returnerer NOT_FOUND når tegningen ikke finnes", async () => {
    const result = await service.updateDrawing(
      "finnes-ikke",
      ALICE,
      drawing()
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });

  it("avviser ugyldige data ved oppdatering", async () => {
    const created = await service.createDrawing(ALICE, drawing());

    if (!created.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const result = await service.updateDrawing(
      created.data.id,
      ALICE,
      drawing({ title: "" })
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("BAD_REQUEST");
      expect(result.error.fieldErrors?.title).toBeDefined();
    }

    const row = await db.query.drawings.findFirst({
      where: { id: created.data.id },
    });

    expect(row?.title).toBe("Min tegning");
  });
});

describe("drawingService.deleteDrawing", () => {
  it("lar Alice slette sin egen tegning", async () => {
    const created = await service.createDrawing(ALICE, drawing());

    if (!created.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const result = await service.deleteDrawing(
      created.data.id,
      ALICE
    );

    expect(result.ok).toBe(true);

    const row = await findDrawing(created.data.id);

    expect(row).toBeUndefined();
  });

  it("hindrer Bob i å slette Alice sin tegning", async () => {
    const created = await service.createDrawing(ALICE, drawing());

    if (!created.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const result = await service.deleteDrawing(
      created.data.id,
      BOB
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }

    const row = await findDrawing(created.data.id);

    expect(row).toBeDefined();
  });

  it("returnerer NOT_FOUND når tegningen ikke finnes", async () => {
    const result = await service.deleteDrawing(
      "finnes-ikke",
      ALICE
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });
});

describe("drawingService.setDrawingVisibility", () => {
  it("lar eieren gjøre en tegning offentlig", async () => {
    const created = await service.createDrawing(ALICE, drawing());

    if (!created.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const result = await service.setDrawingVisibility(
      created.data.id,
      ALICE,
      true
    );

    expect(result.ok).toBe(true);

    const row = await findDrawing(created.data.id);

    expect(row?.isPublic).toBe(true);
  });

  it("hindrer andre brukere i å endre synlighet", async () => {
    const created = await service.createDrawing(ALICE, drawing());

    if (!created.ok) {
      throw new Error("Kunne ikke opprette tegning");
    }

    const result = await service.setDrawingVisibility(
      created.data.id,
      BOB,
      true
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }

    const row = await findDrawing(created.data.id);

    expect(row?.isPublic).toBe(false);
  });

  it("returnerer NOT_FOUND når tegningen ikke finnes", async () => {
    const result = await service.setDrawingVisibility(
      "finnes-ikke",
      ALICE,
      true
    );

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });
});

describe("drawingService.listPublicDrawings", () => {
  it("lister bare offentlige tegninger", async () => {
    const publicDrawing = await service.createDrawing(
      ALICE,
      drawing({ title: "Offentlig" })
    );

    const privateDrawing = await service.createDrawing(
      ALICE,
      drawing({ title: "Privat" })
    );

    if (!publicDrawing.ok || !privateDrawing.ok) {
      throw new Error("Kunne ikke opprette tegninger");
    }

    await service.setDrawingVisibility(
      publicDrawing.data.id,
      ALICE,
      true
    );

    const result = await service.listPublicDrawings(10);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.map((item) => item.title)).toEqual([
        "Offentlig",
      ]);
    }
  });

  it("begrenser antallet tegninger til 20", async () => {
    for (let i = 0; i < 25; i++) {
      const created = await service.createDrawing(
        ALICE,
        drawing({ title: `Tegning ${i}` })
      );

      if (!created.ok) {
        throw new Error("Kunne ikke opprette tegning");
      }

      await service.setDrawingVisibility(
        created.data.id,
        ALICE,
        true
      );
    }

    const result = await service.listPublicDrawings(100);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data).toHaveLength(20);
    }
  });
});

describe("drawingService.listPublicDrawingsByUser", () => {
  it("viser bare brukerens offentlige tegninger", async () => {
    const alicePublic = await service.createDrawing(
      ALICE,
      drawing({ title: "Alice offentlig" })
    );

    const alicePrivate = await service.createDrawing(
      ALICE,
      drawing({ title: "Alice privat" })
    );

    const bobPublic = await service.createDrawing(
      BOB,
      drawing({ title: "Bob offentlig" })
    );

    if (
      !alicePublic.ok ||
      !alicePrivate.ok ||
      !bobPublic.ok
    ) {
      throw new Error("Kunne ikke opprette tegninger");
    }

    await service.setDrawingVisibility(
      alicePublic.data.id,
      ALICE,
      true
    );

    await service.setDrawingVisibility(
      bobPublic.data.id,
      BOB,
      true
    );

    const result = await service.listPublicDrawingsByUser(ALICE);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.map((item) => item.title)).toEqual([
        "Alice offentlig",
      ]);
    }
  });
});

describe("drawingService.listAllDrawingsByUser", () => {
  it("viser både offentlige og private tegninger for eieren", async () => {
    const publicDrawing = await service.createDrawing(
      ALICE,
      drawing({ title: "Offentlig" })
    );

    const privateDrawing = await service.createDrawing(
      ALICE,
      drawing({ title: "Privat" })
    );

    if (!publicDrawing.ok || !privateDrawing.ok) {
      throw new Error("Kunne ikke opprette tegninger");
    }

    await service.setDrawingVisibility(
      publicDrawing.data.id,
      ALICE,
      true
    );

    const result = await service.listAllDrawingsByUser(ALICE);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.map((item) => item.title).sort()).toEqual([
        "Offentlig",
        "Privat",
      ]);
    }
  });

  it("viser ikke tegninger som tilhører andre brukere", async () => {
    await service.createDrawing(ALICE, drawing({ title: "Alice" }));
    await service.createDrawing(BOB, drawing({ title: "Bob" }));

    const result = await service.listAllDrawingsByUser(ALICE);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.map((item) => item.title)).toEqual([
        "Alice",
      ]);
    }
  });
});

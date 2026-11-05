import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/test/db";
import { user } from "@/db/schema";
import type { DB } from "@/db";
import { createDrawingRepository } from "../drawing-repository";

vi.mock("@/db", () => ({ db: {} }));

const ALICE = "user-alice";
const BOB = "user-bob";

let db: DB;
let repository: ReturnType<typeof createDrawingRepository>;

const input = {
  title: "Test drawing",
  width: 10,
  height: 10,
  pixels: Array<string | null>(100).fill("#ffffff"),
};

async function createDrawing(
  userId = ALICE,
  isPublic = false
) {
  const result = await repository.createDrawing(userId, input);

  if (!result.ok) {
    throw new Error("Failed to create test drawing");
  }

  if (isPublic) {
    const visibility = await repository.setDrawingVisibility(
      result.data.id,
      userId,
      true
    );

    if (!visibility.ok) {
      throw new Error("Failed to publish test drawing");
    }
  }

  return result.data.id;
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

  repository = createDrawingRepository(db);
});

describe("createDrawingRepository", () => {
  describe("createDrawing", () => {
    it("creates a drawing with the correct owner", async () => {
      const id = await createDrawing();

      const result = await repository.getDrawing(id);

      expect(result).toMatchObject({
        ok: true,
        data: {
          id,
          userId: ALICE,
          title: "Test drawing",
          width: 10,
          height: 10,
        },
      });
    });

    it("creates private drawings by default", async () => {
      const id = await createDrawing();

      const result = await repository.getDrawing(id);

      expect(result.ok).toBe(true);

      if (!result.ok) return;

      expect(result.data?.isPublic).toBe(false);
    });

    it("serializes pixel data before storing it", async () => {
      const id = await createDrawing();

      const result = await repository.getDrawing(id);

      expect(result.ok).toBe(true);

      if (!result.ok || !result.data) return;

      expect(JSON.parse(result.data.pixels)).toEqual(input.pixels);
    });
  });

  describe("getDrawing", () => {
    it("returns null for a missing drawing", async () => {
      const result = await repository.getDrawing("missing");

      expect(result).toEqual({
        ok: true,
        data: null,
      });
    });
  });

  describe("updateDrawing", () => {
    it("allows the owner to update a drawing", async () => {
      const id = await createDrawing();

      const result = await repository.updateDrawing(id, ALICE, { ...input, title: "Updated drawing" });

      expect(result).toMatchObject({
        ok: true,
        data: { id },
      });

      const updated = await repository.getDrawing(id);

      expect(updated).toMatchObject({
        ok: true,
        data: { title: "Updated drawing" },
      });
    });

    it("prevents other users from updating a drawing", async () => {
      const id = await createDrawing();

      const result = await repository.updateDrawing(id, BOB, { ...input, title: "Unauthorized update" });

      expect(result).toEqual({
        ok: true,
        data: null,
      });

      const original = await repository.getDrawing(id);

      expect(original).toMatchObject({
        ok: true,
        data: { title: "Test drawing" },
      });
    });
  });

  describe("deleteDrawing", () => {
    it("allows the owner to delete a drawing", async () => {
      const id = await createDrawing();

      const result = await repository.deleteDrawing(id, ALICE);

      expect(result).toEqual({
        ok: true,
        data: true,
      });

      const deleted = await repository.getDrawing(id);

      expect(deleted).toEqual({
        ok: true,
        data: null,
      });
    });

    it("prevents other users from deleting a drawing", async () => {
      const id = await createDrawing();

      const result = await repository.deleteDrawing(id, BOB);

      expect(result).toEqual({
        ok: true,
        data: false,
      });

      const existing = await repository.getDrawing(id);

      expect(existing.ok).toBe(true);

      if (!existing.ok) return;

      expect(existing.data).not.toBeNull();
    });
  });

  describe("setDrawingVisibility", () => {
    it("allows the owner to publish a drawing", async () => {
      const id = await createDrawing();

      const result = await repository.setDrawingVisibility(id, ALICE, true);

      expect(result).toMatchObject({
        ok: true,
        data: { id },
      });

      const drawing = await repository.getDrawing(id);

      expect(drawing).toMatchObject({
        ok: true,
        data: { isPublic: true },
      });
    });

    it("prevents other users from changing visibility", async () => {
      const id = await createDrawing();

      const result = await repository.setDrawingVisibility(id, BOB, true);

      expect(result).toEqual({
        ok: true,
        data: null,
      });

      const drawing = await repository.getDrawing(id);

      expect(drawing).toMatchObject({
        ok: true,
        data: { isPublic: false },
      });
    });
  });

  describe("listPublicDrawings", () => {
    it("only returns public drawings", async () => {
      await createDrawing(ALICE, true);
      await createDrawing(ALICE, false);
      await createDrawing(BOB, true);

      const result = await repository.listPublicDrawings(10, 0);

      expect(result.ok).toBe(true);

      if (!result.ok) return;

      expect(result.data).toHaveLength(2);
      expect(result.data.every((drawing) => drawing.isPublic)).toBe(true);
    });

    it("includes the drawing owner", async () => {
      await createDrawing(ALICE, true);

      const result = await repository.listPublicDrawings(10, 0);

      expect(result.ok).toBe(true);

      if (!result.ok) return;

      expect(result.data[0].owner).toEqual({
        id: ALICE,
        username: "alice",
      });
    });

    it("supports pagination", async () => {
      await createDrawing(ALICE, true);
      await createDrawing(ALICE, true);
      await createDrawing(ALICE, true);

      const result = await repository.listPublicDrawings(2, 0);

      expect(result.ok).toBe(true);

      if (!result.ok) return;

      expect(result.data).toHaveLength(2);
    });

    it("counts public drawings", async () => {
      await createDrawing(ALICE, true);
      await createDrawing(ALICE, false);
      await createDrawing(BOB, true);

      const result = await repository.countPublicDrawings();

      expect(result).toEqual({
        ok: true,
        data: 2,
      });
    });
  });

  describe("listPublicDrawingsByUser", () => {
    it("only returns public drawings owned by the user", async () => {
      await createDrawing(ALICE, true);
      await createDrawing(ALICE, false);
      await createDrawing(BOB, true);

      const result = await repository.listPublicDrawingsByUser(ALICE, 10, 0);

      expect(result.ok).toBe(true);

      if (!result.ok) return;

      expect(result.data).toHaveLength(1);
      expect(result.data[0].userId).toBe(ALICE);
      expect(result.data[0].isPublic).toBe(true);
    });

    it("counts public drawings owned by the user", async () => {
      await createDrawing(ALICE, true);
      await createDrawing(ALICE, false);
      await createDrawing(BOB, true);

      const result = await repository.countPublicDrawingsByUser(ALICE);

      expect(result).toEqual({
        ok: true,
        data: 1,
      });
    });
  });

  describe("listAllDrawingsByUser", () => {
    it("returns both public and private drawings owned by the user", async () => {
      await createDrawing(ALICE, true);
      await createDrawing(ALICE, false);
      await createDrawing(BOB, true);

      const result = await repository.listAllDrawingsByUser(ALICE, 10, 0);

      expect(result.ok).toBe(true);

      if (!result.ok) return;

      expect(result.data).toHaveLength(2);
      expect(result.data.every((drawing) => drawing.userId === ALICE)).toBe(true);
    });

    it("counts all drawings owned by the user", async () => {
      await createDrawing(ALICE, true);
      await createDrawing(ALICE, false);
      await createDrawing(BOB, true);

      const result = await repository.countAllDrawingsByUser(ALICE);

      expect(result).toEqual({ok: true, data: 2});
    });
  });

  describe("createRemix", () => {
    it("creates a private copy owned by the remixing user", async () => {
      const originalId = await createDrawing(ALICE, true);

      const original = await repository.getDrawing(originalId);

      if (!original.ok || !original.data) {
        throw new Error("Original drawing not found");
      }

      const result = await repository.createRemix(BOB, original.data);

      expect(result.ok).toBe(true);

      if (!result.ok) return;

      const remix = await repository.getDrawing(result.data.id);

      expect(remix).toMatchObject({
        ok: true,
        data: {
          userId: BOB,
          remixOfId: originalId,
          isPublic: false,
          title: original.data.title,
          pixels: original.data.pixels,
        },
      });
    });
  });
});

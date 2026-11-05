import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "@/test/db";
import { user } from "@/db/schema";
import type { DB } from "@/db";
import { createUserRepository } from "../user-repository";

vi.mock("@/db", () => ({ db: {} }));

const ALICE = "user-alice";
const BOB = "user-bob";

let db: DB;
let repository: ReturnType<typeof createUserRepository>;

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

  repository = createUserRepository(db);
});

describe("createUserRepository", () => {
  it("finds an existing user by username", async () => {
    const result = await repository.findByUsername("alice");

    expect(result).toMatchObject({
      ok: true,
      data: {
        id: ALICE,
        name: "Alice",
        username: "alice",
      },
    });

    if (result.ok) {
      expect(result.data?.createdAt).toBeInstanceOf(Date);
    }
  });

  it("returns null when the user does not exist", async () => {
    const result = await repository.findByUsername("unknown");

    expect(result).toEqual({
      ok: true,
      data: null,
    });
  });

  it("returns the correct user when multiple users exist", async () => {
    const result = await repository.findByUsername("bob");

    expect(result).toMatchObject({
      ok: true,
      data: {
        id: BOB,
        name: "Bob",
        username: "bob",
      },
    });
  });

  it("does not expose sensitive user fields", async () => {
    const result = await repository.findByUsername("alice");

    expect(result.ok).toBe(true);

    if (!result.ok || !result.data) {
      throw new Error("Expected an existing user");
    }

    expect(result.data).not.toHaveProperty("email");
    expect(result.data).not.toHaveProperty("emailVerified");
    expect(result.data).not.toHaveProperty("role");
    expect(result.data).not.toHaveProperty("banned");
  });

  it("does not match usernames with different casing", async () => {
    const result = await repository.findByUsername("Alice");

    expect(result).toEqual({
      ok: true,
      data: null,
    });
  });
});

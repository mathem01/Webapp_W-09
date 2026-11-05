import { describe, expect, it, vi } from "vitest";
import { createUserService } from "../user-service";
import type { UserRepository } from "../user-repository";
import { ResultHandler, Errors } from "@/lib/result";

vi.mock("../user-repository", () => ({repository: {}}));

describe("createUserService", () => {
  const user = {
    id: "user-1",
    name: "Test User",
    username: "testuser",
    image: null,
    createdAt: new Date("2026-01-15T12:30:00.000Z"),
  };

  function setup() {
    const findByUsername = vi.fn<UserRepository["findByUsername"]>();

    const repository: UserRepository = {
      findByUsername,
    };

    return {
      service: createUserService(repository),
      findByUsername,
    };
  }

  it("returns a user DTO when the user exists", async () => {
    const { service, findByUsername } = setup();

    findByUsername.mockResolvedValue(
      ResultHandler.success(user)
    );

    const result = await service.findByUsername("testuser");

    expect(result).toEqual({
      ok: true,
      data: {
        id: "user-1",
        name: "Test User",
        username: "testuser",
        image: null,
        createdAt: "2026-01-15T12:30:00.000Z",
      },
    });

    expect(findByUsername).toHaveBeenCalledWith("testuser");
  });

  it("trims whitespace from the username", async () => {
    const { service, findByUsername } = setup();

    findByUsername.mockResolvedValue(
      ResultHandler.success(user)
    );

    await service.findByUsername("  testuser  ");

    expect(findByUsername).toHaveBeenCalledWith("testuser");
  });

  it("rejects an empty username", async () => {
    const { service, findByUsername } = setup();

    const result = await service.findByUsername("");

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: Errors.BAD_REQUEST,
        fieldErrors: {
          username: ["Brukernavn kan ikke være tomt"],
        },
      },
    });

    expect(findByUsername).not.toHaveBeenCalled();
  });

  it("rejects a whitespace-only username", async () => {
    const { service, findByUsername } = setup();

    const result = await service.findByUsername("   ");

    expect(result).toMatchObject({
      ok: false,
      error: { code: Errors.BAD_REQUEST },
    });

    expect(findByUsername).not.toHaveBeenCalled();
  });

  it("returns NOT_FOUND when the user does not exist", async () => {
    const { service, findByUsername } = setup();

    findByUsername.mockResolvedValue(
      ResultHandler.success(null)
    );

    const result = await service.findByUsername("unknown");

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: Errors.NOT_FOUND,
        message: "Brukeren finnes ikke",
      },
    });
  });

  it("propagates repository errors", async () => {
    const { service, findByUsername } = setup();

    findByUsername.mockResolvedValue(
      ResultHandler.failure(
        "Database error",
        Errors.INTERNAL_SERVER_ERROR
      )
    );

    const result = await service.findByUsername("testuser");

    expect(result).toMatchObject({
      ok: false,
      error: {
        code: Errors.INTERNAL_SERVER_ERROR,
        message: "Database error",
      },
    });
  });
});

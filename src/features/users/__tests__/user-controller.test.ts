
import { describe, expect, it, vi } from "vitest";
import type { RequestInfo } from "rwsdk/worker";
import { createUserController } from "../user-controller";
import type { UserService } from "../user-service";
import { Errors, ResultHandler } from "@/lib/result";

vi.mock("../user-service", () => ({service: {}}));

describe("createUserController", () => {
  function setup(result: Awaited<ReturnType<UserService["findByUsername"]>>) {
    const findByUsername = vi.fn<UserService["findByUsername"]>();
    findByUsername.mockResolvedValue(result);

    const controller = createUserController({
      findByUsername,
    });

    const requestInfo = {
      params: { username: "alice" },
      ctx: {},
    } as RequestInfo;

    return { controller, findByUsername, requestInfo };
  }

  it("returns HTTP 200 when the user exists", async () => {
    const result = ResultHandler.success({
      id: "user-1",
      name: "Alice",
      username: "alice",
      image: null,
      createdAt: "2026-01-15T12:30:00.000Z",
    });

    const { controller, requestInfo, findByUsername } =
      setup(result);

    const response = await controller.find(requestInfo);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(result);
    expect(findByUsername).toHaveBeenCalledWith("alice");
  });

  it("returns HTTP 404 when the user does not exist", async () => {
    const { controller, requestInfo } = setup(
      ResultHandler.failure("Not found", Errors.NOT_FOUND)
    );

    const response = await controller.find(requestInfo);

    expect(response.status).toBe(404);
  });

  it("returns HTTP 400 for an invalid username", async () => {
    const { controller, requestInfo } = setup(
      ResultHandler.failure("Invalid username", Errors.BAD_REQUEST)
    );

    const response = await controller.find(requestInfo);

    expect(response.status).toBe(400);
  });

  it("returns HTTP 500 when the service fails", async () => {
    const { controller, requestInfo } = setup(
      ResultHandler.failure(
        "Database error",
        Errors.INTERNAL_SERVER_ERROR
      )
    );

    const response = await controller.find(requestInfo);

    expect(response.status).toBe(500);
  });
});

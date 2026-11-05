import { describe, expect, it, vi, beforeEach } from "vitest";
import type { RequestInfo } from "rwsdk/worker";
import { ErrorResponse } from "@/test/worker-mock"
import { createDrawingController } from "../drawing-controller";
import type { DrawingService } from "../drawing-service";
import { DEFAULT_PAGE_SIZE } from "../drawing-service";
import { Errors, ResultHandler } from "@/lib/result";
import { requireUser } from "@/middleware/guards";

vi.mock("rwsdk/worker", () => import("@/test/worker-mock"));

vi.mock("../drawing-service", async () => ({
  service: {},
  DEFAULT_PAGE_SIZE: 12,
}));

vi.mock("@/middleware/guards", () => ({
  requireUser: vi.fn(),
}));

const ALICE = "user-alice";

const input = {
  title: "Test drawing",
  width: 10,
  height: 10,
  pixels: Array(100).fill("#ffffff"),
};

function setup() {
  const service = {
    createDrawing: vi.fn<DrawingService["createDrawing"]>(),
    getDrawing: vi.fn<DrawingService["getDrawing"]>(),
    remixDrawing: vi.fn<DrawingService["remixDrawing"]>(),
    updateDrawing: vi.fn<DrawingService["updateDrawing"]>(),
    deleteDrawing: vi.fn<DrawingService["deleteDrawing"]>(),
    listPublicDrawings:
      vi.fn<DrawingService["listPublicDrawings"]>(),
    listPublicDrawingsByUser:
      vi.fn<DrawingService["listPublicDrawingsByUser"]>(),
    listAllDrawingsByUser:
      vi.fn<DrawingService["listAllDrawingsByUser"]>(),
    setDrawingVisibility:
      vi.fn<DrawingService["setDrawingVisibility"]>(),
  };

  return {
    service,
    controller: createDrawingController(service),
  };
}

function requestInfo({
  method = "GET",
  path = "/api/v1/drawings",
  body,
  params = {},
  userId = ALICE,
}: {
  method?: string;
  path?: string;
  body?: unknown;
  params?: Record<string, string>;
  userId?: string;
} = {}): RequestInfo {
  return {
    request: new Request(`http://localhost${path}`, {
      method,
      ...(body !== undefined
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : {}),
    }),
    params,
    ctx: {
      session: { userId },
    },
  } as unknown as RequestInfo;
}

beforeEach(() => {
  vi.mocked(requireUser).mockReturnValue({userId: ALICE} as ReturnType<typeof requireUser>);
});

describe("createDrawingController", () => {
  describe("create", () => {
    it("returns HTTP 201 when a drawing is created", async () => {
      const { controller, service } = setup();

      service.createDrawing.mockResolvedValue(
        ResultHandler.success({ id: "drawing-1" })
      );

      const response = await controller.create(
        requestInfo({
          method: "POST",
          body: input,
        })
      );

      expect(response.status).toBe(201);
      expect(service.createDrawing).toHaveBeenCalledWith(ALICE, input);
      expect(await response.json()).toMatchObject({
        ok: true,
        data: { id: "drawing-1" },
      });
    });

    it("returns HTTP 400 for invalid JSON", async () => {
      const { controller, service } = setup();

      const info = requestInfo({ method: "POST" });

      info.request = new Request(
        "http://localhost/api/v1/drawings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{invalid",
        }
      );

      const response = await controller.create(info);

      expect(response.status).toBe(400);
      expect(service.createDrawing).not.toHaveBeenCalled();
    });
  });

  describe("get", () => {
    it("passes the drawing ID and user ID to the service", async () => {
      const { controller, service } = setup();

      service.getDrawing.mockResolvedValue(
        ResultHandler.failure(
          "Drawing not found",
          Errors.NOT_FOUND
        )
      );

      const response = await controller.get(
        requestInfo({
          params: { drawingId: "drawing-1" },
        })
      );

      expect(service.getDrawing).toHaveBeenCalledWith("drawing-1", ALICE);
      expect(response.status).toBe(404);
    });
  });

  describe("delete", () => {
    it("deletes a drawing owned by the authenticated user", async () => {
      const { controller, service } = setup();

      service.deleteDrawing.mockResolvedValue(
        ResultHandler.success(undefined)
      );

      const response = await controller.delete(
        requestInfo({
          method: "DELETE",
          params: { drawingId: "drawing-1" },
        })
      );

      expect(service.deleteDrawing).toHaveBeenCalledWith("drawing-1", ALICE);
      expect(response.status).toBe(200);
    });

    it("returns HTTP 404 when the drawing does not exist", async () => {
      const { controller, service } = setup();

      service.deleteDrawing.mockResolvedValue(
        ResultHandler.failure(
          "Drawing not found",
          Errors.NOT_FOUND
        )
      );

      const response = await controller.delete(
        requestInfo({
          method: "DELETE",
          params: { drawingId: "missing" },
        })
      );

      expect(response.status).toBe(404);
    });
  });

  describe("listPublic", () => {
    it("uses default pagination values", async () => {
      const { controller, service } = setup();

      service.listPublicDrawings.mockResolvedValue(
        ResultHandler.success({
          items: [],
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
          total: 0,
          totalPages: 1,
        })
      );

      const response = await controller.listPublic(requestInfo());

      expect(response.status).toBe(200);
      expect(service.listPublicDrawings).toHaveBeenCalledWith(1, DEFAULT_PAGE_SIZE);
    });

    it("passes pagination parameters to the service", async () => {
      const { controller, service } = setup();

      service.listPublicDrawings.mockResolvedValue(
        ResultHandler.success({
          items: [],
          page: 2,
          limit: 10,
          total: 20,
          totalPages: 2,
        })
      );

      await controller.listPublic(
        requestInfo({
          path: "/api/v1/drawings?page=2&limit=10",
        })
      );

      expect(service.listPublicDrawings).toHaveBeenCalledWith(2, 10);
    });
  });

  describe("listPublicByUser", () => {
    it("passes the user ID and pagination parameters", async () => {
      const { controller, service } = setup();

      service.listPublicDrawingsByUser.mockResolvedValue(
        ResultHandler.success({
          items: [],
          page: 2,
          limit: 5,
          total: 0,
          totalPages: 1,
        })
      );

      await controller.listPublicByUser(
        requestInfo({
          path: "/api/v1/users/user-bob/drawings?page=2&limit=5",
          params: { userId: "user-bob" },
        })
      );

      expect(service.listPublicDrawingsByUser).toHaveBeenCalledWith("user-bob", 2, 5);
    });
  });

  describe("listAllByUser", () => {
    it("only requests drawings for the authenticated user", async () => {
      const { controller, service } = setup();

      service.listAllDrawingsByUser.mockResolvedValue(
        ResultHandler.success({
          items: [],
          page: 1,
          limit: DEFAULT_PAGE_SIZE,
          total: 0,
          totalPages: 1,
        })
      );

      await controller.listAllByUser(requestInfo());
      expect(service.listAllDrawingsByUser).toHaveBeenCalledWith(ALICE, 1, DEFAULT_PAGE_SIZE);
    });
  });

  describe("setVisibility", () => {
    it("passes visibility changes to the service", async () => {
      const { controller, service } = setup();

      service.setDrawingVisibility.mockResolvedValue(
        ResultHandler.success(undefined)
      );

      const response = await controller.setVisibility(
        requestInfo({
          method: "PATCH",
          params: { drawingId: "drawing-1" },
          body: { isPublic: true },
        })
      );

      expect(service.setDrawingVisibility).toHaveBeenCalledWith("drawing-1", ALICE, { isPublic: true });
      expect(response.status).toBe(200);
    });
  });
});

describe("authentication", () => {
  beforeEach(() => {
    vi.mocked(requireUser).mockImplementation(() => {
      throw new ErrorResponse(401, "Login required");
    });
  });

  it("rejects unauthenticated drawing creation", async () => {
    const { controller, service } = setup();

    await expect(
      controller.create(
        requestInfo({
          method: "POST",
          body: input,
        })
      )
    ).rejects.toMatchObject({
      code: 401,
      message: "Login required",
    });

    expect(service.createDrawing).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated drawing updates", async () => {
    const { controller, service } = setup();

    await expect(
      controller.update(
        requestInfo({
          method: "PUT",
          params: { drawingId: "drawing-1" },
          body: input,
        })
      )
    ).rejects.toMatchObject({
      code: 401,
      message: "Login required",
    });

    expect(service.updateDrawing).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated drawing deletion", async () => {
    const { controller, service } = setup();

    await expect(
      controller.delete(
        requestInfo({
          method: "DELETE",
          params: { drawingId: "drawing-1" },
        })
      )
    ).rejects.toMatchObject({
      code: 401,
      message: "Login required",
    });

    expect(service.deleteDrawing).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated visibility changes", async () => {
    const { controller, service } = setup();

    await expect(
      controller.setVisibility(
        requestInfo({
          method: "PATCH",
          params: { drawingId: "drawing-1" },
          body: { isPublic: true },
        })
      )
    ).rejects.toMatchObject({
      code: 401,
      message: "Login required",
    });

    expect(service.setDrawingVisibility).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated access to personal drawings", async () => {
    const { controller, service } = setup();

    await expect(
      controller.listAllByUser(requestInfo())
    ).rejects.toMatchObject({
      code: 401,
      message: "Login required",
    });

    expect(service.listAllDrawingsByUser).not.toHaveBeenCalled();
  });
});


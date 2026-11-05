import { describe, expect, it, vi } from "vitest";
import {
  createDrawingService,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../drawing-service";
import type { DrawingRepository } from "../drawing-repository";
import { Errors, ResultHandler } from "@/lib/result";
import type { Drawing } from "@/db/schema";

vi.mock("../drawing-repository", () => ({repository: {}}));

const ALICE = "user-alice";
const BOB = "user-bob";

const input = {
  title: "Test drawing",
  width: 10,
  height: 10,
  pixels: Array<string | null>(100).fill("#ffffff"),
};

const storedDrawing = {
  id: "drawing-1",
  userId: ALICE,
  title: input.title,
  width: input.width,
  height: input.height,
  pixels: JSON.stringify(input.pixels),
  isPublic: false,
  allowRemix: false,
  remixOfId: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
} as Drawing;

function setup() {
  const repository = {
    createDrawing: vi.fn<DrawingRepository["createDrawing"]>(),
    getDrawing: vi.fn<DrawingRepository["getDrawing"]>(),
    createRemix: vi.fn<DrawingRepository["createRemix"]>(),
    updateDrawing: vi.fn<DrawingRepository["updateDrawing"]>(),
    deleteDrawing: vi.fn<DrawingRepository["deleteDrawing"]>(),
    listPublicDrawings: vi.fn<DrawingRepository["listPublicDrawings"]>(),
    countPublicDrawings: vi.fn<DrawingRepository["countPublicDrawings"]>(),
    listPublicDrawingsByUser: vi.fn<DrawingRepository["listPublicDrawingsByUser"]>(),
    countPublicDrawingsByUser: vi.fn<DrawingRepository["countPublicDrawingsByUser"]>(),
    listAllDrawingsByUser: vi.fn<DrawingRepository["listAllDrawingsByUser"]>(),
    countAllDrawingsByUser: vi.fn<DrawingRepository["countAllDrawingsByUser"]>(),
    setDrawingVisibility: vi.fn<DrawingRepository["setDrawingVisibility"]>(),
  };

  return {
    repository,
    service: createDrawingService(repository),
  };
}

describe("createDrawingService", () => {
  describe("createDrawing", () => {
    it("creates a drawing with valid input", async () => {
      const { service, repository } = setup();

      repository.createDrawing.mockResolvedValue(
        ResultHandler.success({ id: "drawing-1" })
      );

      const result = await service.createDrawing(ALICE, input);

      expect(result).toEqual({
        ok: true,
        data: { id: "drawing-1" },
      });

      expect(repository.createDrawing).toHaveBeenCalledWith(ALICE, input);
    });

    it("rejects invalid input", async () => {
      const { service, repository } = setup();

      const result = await service.createDrawing(ALICE, {
        ...input,
        title: "",
      });

      expect(result).toMatchObject({
        ok: false,
        error: {
          code: Errors.BAD_REQUEST,
        },
      });

      expect(repository.createDrawing).not.toHaveBeenCalled();
    });

    it("rejects incorrect pixel counts", async () => {
      const { service, repository } = setup();

      const result = await service.createDrawing(ALICE, {
        ...input,
        pixels: ["#ffffff"],
      });

      expect(result).toMatchObject({
        ok: false,
        error: {
          code: Errors.BAD_REQUEST,
        },
      });

      expect(repository.createDrawing).not.toHaveBeenCalled();
    });

    it("propagates repository errors", async () => {
      const { service, repository } = setup();

      repository.createDrawing.mockResolvedValue(
        ResultHandler.failure(
          "Database error",
          Errors.INTERNAL_SERVER_ERROR
        )
      );

      const result = await service.createDrawing(ALICE, input);

      expect(result).toMatchObject({
        ok: false,
        error: {
          code: Errors.INTERNAL_SERVER_ERROR,
        },
      });
    });

    it("returns NOT_FOUND when no ID is returned", async () => {
      const { service, repository } = setup();

      repository.createDrawing.mockResolvedValue(
        ResultHandler.success(
          undefined as unknown as { id: string }
        )
      );

      const result = await service.createDrawing(ALICE, input);

      expect(result).toMatchObject({
        ok: false,
        error: { code: Errors.NOT_FOUND },
      });
    });
  });

  describe("getDrawing", () => {
    it("allows anyone to view a public drawing", async () => {
      const { service, repository } = setup();

      repository.getDrawing.mockResolvedValue(
        ResultHandler.success({
          ...storedDrawing,
          isPublic: true,
        })
      );

      const result = await service.getDrawing("drawing-1", BOB);

      expect(result).toMatchObject({
        ok: true,
        data: {
          id: "drawing-1",
          title: "Test drawing",
          isPublic: true,
        },
      });
    });

    it("allows the owner to view a private drawing", async () => {
      const { service, repository } = setup();

      repository.getDrawing.mockResolvedValue(
        ResultHandler.success(storedDrawing)
      );

      const result = await service.getDrawing("drawing-1", ALICE);

      expect(result.ok).toBe(true);
    });

    it("prevents other users from viewing private drawings", async () => {
      const { service, repository } = setup();

      repository.getDrawing.mockResolvedValue(
        ResultHandler.success(storedDrawing)
      );

      const result = await service.getDrawing("drawing-1", BOB);

      expect(result).toMatchObject({
        ok: false,
        error: { code: Errors.NOT_FOUND },
      });
    });

    it("returns NOT_FOUND for missing drawings", async () => {
      const { service, repository } = setup();

      repository.getDrawing.mockResolvedValue(
        ResultHandler.success(null)
      );

      const result = await service.getDrawing("missing", ALICE);

      expect(result).toMatchObject({
        ok: false,
        error: { code: Errors.NOT_FOUND },
      });
    });
  });

  describe("updateDrawing", () => {
    it("updates a drawing with valid input", async () => {
      const { service, repository } = setup();

      repository.updateDrawing.mockResolvedValue(
        ResultHandler.success({ id: "drawing-1" })
      );

      const result = await service.updateDrawing("drawing-1", ALICE, input);

      expect(result).toEqual({
        ok: true,
        data: undefined,
      });

      expect(repository.updateDrawing).toHaveBeenCalledWith("drawing-1", ALICE, input);
    });

    it("rejects invalid input before accessing the repository", async () => {
      const { service, repository } = setup();

      const result = await service.updateDrawing("drawing-1", ALICE, { ...input, width: -1 });

      expect(result).toMatchObject({
        ok: false,
        error: { code: Errors.BAD_REQUEST },
      });

      expect(repository.updateDrawing).not.toHaveBeenCalled();
    });

    it("returns NOT_FOUND when the drawing cannot be updated", async () => {
      const { service, repository } = setup();

      repository.updateDrawing.mockResolvedValue(
        ResultHandler.success(null)
      );

      const result = await service.updateDrawing("drawing-1", BOB, input);

      expect(result).toMatchObject({
        ok: false,
        error: { code: Errors.NOT_FOUND },
      });
    });
  });

  describe("deleteDrawing", () => {
    it("allows the owner to delete a drawing", async () => {
      const { service, repository } = setup();

      repository.getDrawing.mockResolvedValue(
        ResultHandler.success(storedDrawing)
      );

      repository.deleteDrawing.mockResolvedValue(
        ResultHandler.success(true)
      );

      const result = await service.deleteDrawing("drawing-1", ALICE);

      expect(result.ok).toBe(true);
      expect(repository.deleteDrawing).toHaveBeenCalledWith("drawing-1", ALICE);
    });

    it("prevents other users from deleting a drawing", async () => {
      const { service, repository } = setup();

      repository.getDrawing.mockResolvedValue(
        ResultHandler.success(storedDrawing)
      );

      const result = await service.deleteDrawing("drawing-1", BOB);

      expect(result).toMatchObject({
        ok: false,
        error: { code: Errors.NOT_FOUND },
      });

      expect(repository.deleteDrawing).not.toHaveBeenCalled();
    });

    it("returns NOT_FOUND when the drawing does not exist", async () => {
      const { service, repository } = setup();

      repository.getDrawing.mockResolvedValue(
        ResultHandler.success(null)
      );

      const result = await service.deleteDrawing("missing", ALICE);

      expect(result).toMatchObject({
        ok: false,
        error: { code: Errors.NOT_FOUND },
      });
    });
  });

  describe("setDrawingVisibility", () => {
    it("publishes a drawing", async () => {
      const { service, repository } = setup();

      repository.setDrawingVisibility.mockResolvedValue(
        ResultHandler.success({ id: "drawing-1" })
      );

      const result = await service.setDrawingVisibility("drawing-1", ALICE, { isPublic: true });

      expect(result.ok).toBe(true);
      expect(repository.setDrawingVisibility).toHaveBeenCalledWith("drawing-1", ALICE, true);
    });

    it("rejects invalid visibility input", async () => {
      const { service, repository } = setup();

      const result = await service.setDrawingVisibility("drawing-1", ALICE, { isPublic: "true" });

      expect(result).toMatchObject({
        ok: false,
        error: { code: Errors.BAD_REQUEST },
      });

      expect(repository.setDrawingVisibility).not.toHaveBeenCalled();
    });

    it("returns NOT_FOUND when visibility cannot be updated", async () => {
      const { service, repository } = setup();

      repository.setDrawingVisibility.mockResolvedValue(
        ResultHandler.success(null)
      );

      const result = await service.setDrawingVisibility("drawing-1", BOB, { isPublic: true });

      expect(result).toMatchObject({
        ok: false,
        error: { code: Errors.NOT_FOUND },
      });
    });
  });

  describe("listPublicDrawings", () => {
    it("calculates the correct offset", async () => {
      const { service, repository } = setup();

      repository.countPublicDrawings.mockResolvedValue(ResultHandler.success(40));

      repository.listPublicDrawings.mockResolvedValue(ResultHandler.success([]));

      await service.listPublicDrawings(2, 10);

      expect(repository.listPublicDrawings).toHaveBeenCalledWith(10, 10);
    });

    it("limits the maximum page size", async () => {
      const { service, repository } = setup();

      repository.countPublicDrawings.mockResolvedValue(
        ResultHandler.success(100)
      );

      repository.listPublicDrawings.mockResolvedValue(
        ResultHandler.success([])
      );

      const result = await service.listPublicDrawings(1, 999);

      expect(repository.listPublicDrawings).toHaveBeenCalledWith(MAX_PAGE_SIZE, 0);

      expect(result).toMatchObject({
        ok: true,
        data: { limit: MAX_PAGE_SIZE },
      });
    });

    it("clamps pages exceeding the total number of pages", async () => {
      const { service, repository } = setup();

      repository.countPublicDrawings.mockResolvedValue(
        ResultHandler.success(15)
      );

      repository.listPublicDrawings.mockResolvedValue(
        ResultHandler.success([])
      );

      const result = await service.listPublicDrawings(99, 10);

      expect(repository.listPublicDrawings).toHaveBeenCalledWith(10, 10);

      expect(result).toMatchObject({
        ok: true,
        data: {
          page: 2,
          totalPages: 2,
        },
      });
    });

    it("propagates count errors", async () => {
      const { service, repository } = setup();

      repository.countPublicDrawings.mockResolvedValue(
        ResultHandler.failure(
          "Database error",
          Errors.INTERNAL_SERVER_ERROR
        )
      );

      const result = await service.listPublicDrawings();

      expect(result).toMatchObject({
        ok: false,
        error: { code: Errors.INTERNAL_SERVER_ERROR },
      });

      expect(repository.listPublicDrawings).not.toHaveBeenCalled();
    });
  });
});

import type { RequestInfo } from "rwsdk/worker";
import { ErrorHttpStatus, Errors, parseJson, ResultHandler, toResponse } from "@/lib/result";
import {
  type DrawingService,
  service,
} from "./drawing-service";
import { requireUser } from "@/middleware/guards";

export interface DrawingController {
  create(requestInfo: RequestInfo): Promise<Response>;
  get(requestInfo: RequestInfo): Promise<Response>;
  update(requestInfo: RequestInfo): Promise<Response>;
  delete(requestInfo: RequestInfo): Promise<Response>;

  listPublic(requestInfo: RequestInfo): Promise<Response>;
  listPublicByUser(requestInfo: RequestInfo): Promise<Response>;
  listAllByUser(requestInfo: RequestInfo): Promise<Response>;

  setVisibility(requestInfo: RequestInfo): Promise<Response>;
}

export function createDrawingController(_service: DrawingService): DrawingController {
  return {
    async create({ request }: RequestInfo): Promise<Response> {
      const { userId } = requireUser();

      const body = await parseJson(request);
      if (!body.ok) return toResponse(body);

      const result = await _service.createDrawing(
        userId!,
        body.data
      );

      return toResponse(result, 201);
    },
    async get({ params, ctx }: RequestInfo) {
      const result = await _service.getDrawing(params.drawingId, ctx.session.userId!);

      return toResponse(result)
    },
    async update({ request, params }: RequestInfo) {
      const { userId } = requireUser()

      const body = await parseJson(request);
      if (!body.ok) return toResponse(body);

      const result = await _service.updateDrawing(params.drawingId, userId!, body);

      return toResponse(result)
    },
    async delete({ params }: RequestInfo) {
      const { userId } = requireUser();

      const result = await _service.deleteDrawing(params.drawingId, userId!);

      return toResponse(result);
    },
    async listPublic({ params }: RequestInfo) {
      if (!Number.isInteger(params.limit)) {
        return toResponse(
          ResultHandler.failure(
            "Limit må være et heltall",
            Errors.BAD_REQUEST
          )
        )
      }

      const result = await _service.listPublicDrawings(params.limit);

      return toResponse(result);
    },
    async listPublicByUser({ params }: RequestInfo): Promise<Response> {
      const result = await _service.listPublicDrawingsByUser(params.userId);

      return toResponse(result);
    },
    async listAllByUser(): Promise<Response> {
      const { userId } = requireUser();

      const result = await _service.listAllDrawingsByUser(userId!);

      return toResponse(result);
    },
    async setVisibility({ request, params }: RequestInfo): Promise<Response> {
      const { userId } = requireUser();

      const body = await parseJson(request);
      if (!body.ok) return toResponse(body);

      const result = await _service.setDrawingVisibility(params.drawingId, userId!, body.data);

      return toResponse(result);
    },
  };
}

export const controller = createDrawingController(service);
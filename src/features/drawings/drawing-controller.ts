import type { RequestInfo } from "rwsdk/worker";
import { ErrorHttpStatus, Errors, parseJson, ResultHandler, toResponse } from "@/lib/result";
import { type DrawingService, DEFAULT_PAGE_SIZE } from "./drawing-service";
import { service } from "./drawing-service";
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

/* Leser sidetall og sidestørrelse fra spørringsstrengen.
   Sidetall og sidestørrelse er spørringsparametre, ikke del av stien:
   de er filter på samme ressurs, ikke en annen ressurs. Ugyldige
   verdier blir til standardverdiene i servicen, ikke 400. */
function readPageParams(request: Request) {
  const params = new URL(request.url).searchParams;

  return {
    page: Number(params.get("page") ?? 1),
    limit: Number(params.get("limit") ?? DEFAULT_PAGE_SIZE),
  };
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

      const result = await _service.updateDrawing(params.drawingId, userId!, body.data);

      return toResponse(result)
    },
    async delete({ params }: RequestInfo) {
      const { userId } = requireUser();

      const result = await _service.deleteDrawing(params.drawingId, userId!);

      return toResponse(result);
    },
       /* GET /api/v1/drawings?page=2&limit=12 */
    async listPublic({ request }: RequestInfo) {
      const { page, limit } = readPageParams(request);

      const result = await _service.listPublicDrawings(page, limit);

      return toResponse(result);
    },

    async listPublicByUser({ request, params }: RequestInfo): Promise<Response> {
      const { page, limit } = readPageParams(request);

      const result = await _service.listPublicDrawingsByUser(params.userId, page, limit);

      return toResponse(result);
    },
    async listAllByUser({ request }: RequestInfo): Promise<Response> {
      const { userId } = requireUser();

      const { page, limit } = readPageParams(request);

      const result = await _service.listAllDrawingsByUser(userId!, page, limit);

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
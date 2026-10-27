import { route } from "rwsdk/router";
import { controller } from "./drawing-controller";
import { requireAuth } from "@/middleware/guards";

export const drawingRoutes = [
  route("/api/v1/drawings", {
    get: controller.listPublic,
    post: [
      requireAuth,
      controller.create,
    ],
  }),

  route("/api/v1/drawings/:drawingId", {
    get: controller.get,
    patch: [
      requireAuth,
      controller.update,
    ],
    delete: [
      requireAuth,
      controller.delete,
    ],
  }),

  route("/api/v1/drawings/:drawingId/visibility", {
    patch: [
      requireAuth,
      controller.setVisibility,
    ],
  }),

  route("/api/v1/users/:userId/drawings", {
    get: controller.listPublicByUser,
  }),

  route("/api/v1/me/drawings", {
    get: [
      requireAuth,
      controller.listAllByUser,
    ],
  }),
];
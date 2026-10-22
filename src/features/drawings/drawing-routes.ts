/* Alle REST-ruter for tegninger samlet ett sted */

import { route } from "rwsdk/router";

import { db } from "@/db";
import {
  getDrawing,
  listUserDrawings,
  publishDrawing,
  unpublishDrawing,
} from "@/features/drawings/drawing-service";

/* Handlingene som er lov i /:action. Ukjent navn gir 404, så URL-en ikke
   kan brukes til å prøve seg frem. */
const ACTIONS = {
  publish: publishDrawing,
  unpublish: unpublishDrawing,
};

export const drawingRoutes = [
  route("/api/v1/drawings", {
    get: async ({ ctx }) => {
      if (!ctx.session.userId) {
        return Response.json(
          { ok: false, error: "Du må være logget inn", status: 401 },
          { status: 401 }
        );
      }

      const result = await listUserDrawings(
        db,
        ctx.session.userId,
        ctx.session.userId
      );

      return Response.json(result, { status: 200 });
    },
  }),

  route("/api/v1/drawings/:id", {
    get: async ({ params, ctx }) => {
      const result = await getDrawing(db, params.id, ctx.session.userId);

      return Response.json(result, {
        status: result.ok ? 200 : result.status,
      });
    },
  }),

  /* POST /api/v1/drawings/:id/publish, og /unpublish
     En handling på én tegning, i stedet for at klienten sender feltet selv.
     Klienten slipper å vite at kolonnen heter is_public. */
  route("/api/v1/drawings/:id/:action", {
    post: async ({ params, ctx }) => {
      if (!ctx.session.userId) {
        return Response.json(
          { ok: false, error: "Du må være logget inn", status: 401 },
          { status: 401 }
        );
      }

      const handler = ACTIONS[params.action as keyof typeof ACTIONS];
      if (!handler) {
        return Response.json(
          { ok: false, error: "Ukjent handling", status: 404 },
          { status: 404 }
        );
      }

      const result = await handler(db, ctx.session.userId, params.id);

      return Response.json(result, {
        status: result.ok ? 200 : result.status,
      });
    },
  }),
];
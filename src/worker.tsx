import { env } from "cloudflare:workers";
import { seedData } from "@/db/seed";
import { defineApp } from "rwsdk/worker";
import { render, layout, route } from "rwsdk/router";
import { Document } from "@/app/Document";

import { setCommonHeaders } from "@/app/headers";
import { auth } from "./lib/auth";
import { Session, sessionMiddleware } from "./middleware/session";
import { requireGuest, requireAuth, requireAdmin } from "./middleware/guards";

import { AppLayout } from "@/app/layouts/AppLayout"
import { Home } from "@/app/pages/Home";
import { Explore } from "@/app/pages/Explore";
import { Drawing } from "@/app/pages/Drawing";
import { Register } from "@/app/pages/Register";
import { Login } from "@/app/pages/Login";
import { Profile } from "@/app/pages/Profile";
import { MyPage } from "@/app/pages/MyPage";
import { Canvas } from "@/app/pages/Canvas";
import { Admin } from "@/app/pages/Admin";
import { db } from "@/db";
import { getDrawing, listMyDrawings} from "@/lib/drawing-service";

/**
 * Alt som ligger på `ctx` for én forespørsel.
 *
 * Tom nå. Legger dere til `user` her, blir `ctx.user` typet i hele appen,
 * fordi types/rw.d.ts mater denne typen inn i rwsdk.
 */
export type AppContext = {
  session: Session;
};

const app = defineApp([
  // Middleware. Kjører for hver forespørsel, i rekkefølgen de står.
  setCommonHeaders(),
  sessionMiddleware,

  // API-rute. Ligger UTENFOR render(), så svaret er akkurat det handleren
  // returnerer: JSON, uten HTML-skall rundt.
  
  route("/api/v1/auth/*", ({ request }) => 
    auth.handler(request)
  ),

  route("/api/v1/status", () =>
    Response.json({ status: "ok", version: "0.1.0" })
  ),

  route("/api/v1/drawings", {
    get: async ({ ctx }) => {
      if (!ctx.session.userId) {
        return Response.json(
          { ok: false, error: "Du må være logget inn", status: 401 },
          { status: 401 }
        );
      }

      const result = await listMyDrawings(db, ctx.session.userId);

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
    // Kjører seed gjennom utviklingsserveren. `pnpm seed` (rwsdk worker-run)
  // rekker ikke å starte før den gir opp å vente, så dette er alternativet.
  // Åpne http://localhost:5173/__seed
  //
  // import.meta.env.DEV er false i produksjonsbygget, så ruten finnes bare
  // lokalt og kan derfor ligge i repoet.
  ...(import.meta.env.DEV
    ? [
        route("/__seed", async () => {
          await seedData(env);
          return Response.json({ ok: true });
        }),
      ]
    : []),

  // Sider. render(Document, [...]) pakker dem i et helt HTML-dokument.
  render(Document, [
    layout(AppLayout, [
        // Everyone
        route("/", Home),
        route("/explore", Explore),
        route("/drawing/:id", Drawing),
        route("/profile/:username", Profile),

        // Guests-Only
        route("/register", [requireGuest, Register]),
        route("/login", [requireGuest, Login]),

        // Users-Only
        route("/myPage", [requireAuth, MyPage]),
        route("/canvas/:id", [requireAuth, Canvas]),

        // Admin-Only
        route("/admin", [requireAdmin, Admin])
    ]),
  ]),
]);

export default { fetch: app.fetch };

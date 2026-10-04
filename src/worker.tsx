import { defineApp } from "rwsdk/worker";
import { render, layout, route } from "rwsdk/router";
import { Document } from "@/app/Document";

import { setCommonHeaders } from "@/app/headers";
import { auth } from "./lib/auth";
import { Session, sessionMiddleware } from "./middleware/session";

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
  
  route("/api/auth/*", ({ request }) => 
    auth.handler(request)
  ),

  route("/api/status", () =>
    Response.json({ status: "ok", version: "0.1.0" })
  ),

  // Sider. render(Document, [...]) pakker dem i et helt HTML-dokument.
  render(Document, [
    layout(AppLayout, [
        route("/", Home),
        route("/explore", Explore),
        route("/drawing/:id", Drawing),
        route("/register", Register),
        route("/login", Login),
        route("/profile/:username", Profile),
        route("/myPage", MyPage),
        route("/canvas/:id", Canvas),
        route("/admin", Admin)
    ]),
  ]),
]);

export default { fetch: app.fetch };

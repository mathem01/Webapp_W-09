import type { RequestInfo } from "rwsdk/worker";
import { auth } from "@/lib/auth";

export type Session = {
  userId: string | null;
  name: string | null;
  email: string | null;
  username: string | null;
  role: string | null;
  isAuthenticated: boolean;
};

declare module "rwsdk/worker" {
  interface DefaultAppContext {
    session: Session;
  }
}

export async function sessionMiddleware({ request, ctx }: RequestInfo) {
  const result = await auth.api.getSession({ headers: request.headers });
  ctx.session = result?.user
    ? {
        userId: result.user.id,
        name: result.user.name,
        username: result.user.username, 
        email: result.user.email,
        role: result.user.role ?? "user",
        isAuthenticated: true,
      }
    : { 
        userId: null, 
        username: null,
        name: null, 
        email: null,
        role: null,
        isAuthenticated: false };
}
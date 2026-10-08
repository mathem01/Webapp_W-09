import { ErrorResponse, requestInfo } from "rwsdk/worker";
import type { Session } from "@/middleware/session";
import type { AppContext } from "@/worker";

/** 401: vi vet ikke hvem du er. */
export function requireUser(): Session {
  const { ctx } = requestInfo;
  if (!ctx.session?.isAuthenticated) {
    throw new ErrorResponse(401, "Login required");
  }
  return ctx.session;
}

/** 403: vi vet hvem du er, men du eier ikke ressursen. */
export function requireOwner(ownerId: string): Session {
  const session = requireUser();
  if (session.userId !== ownerId) {
    throw new ErrorResponse(403, "You don't own this resource");
  }
  return session;
}

/** 403 på rolle — krever at admin-pluginen er slått på. */
export function requireRole(role: string) {
  const session = requireUser() as Session & { role?: string };
  if (session.role !== role) throw new ErrorResponse(403, `Requires role «${role}»`);
  return session;
}

export function requireAdmin() {
    requireRole("admin");
}

export function requireGuest({ ctx }: {ctx: AppContext}) {
    if (ctx.session?.isAuthenticated) {
        return new Response(null, {
            status: 302,
            headers: { Location: `/myPage` },
        })
    }
}

export async function requireAuth({ ctx, request }: { ctx: AppContext, request: Request }) {
  if (ctx.session?.isAuthenticated) return; // slipp gjennom

  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/html")) {
    // Nettleser-navigasjon: send til login, og tilbake hit etterpå
    return new Response(null, {
      status: 302,
      headers: { Location: `/login?from=${encodeURIComponent(request.url)}` },
    });
  }
  return new Response("Login required", { status: 401 }); // fetch/curl
}
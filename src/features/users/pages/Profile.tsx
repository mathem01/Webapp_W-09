import type { RequestInfo } from "rwsdk/worker";
import { service as userService } from "../user-service";
import { service as drawingService } from "@/features/drawings/drawing-instances";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileDrawings } from "../components/ProfileDrawings";

export async function Profile({ params, request }: RequestInfo) {
  const username = params.username;
  if (!username) return new Response("Ugyldig brukernavn", { status: 400 });

  const normalizedUsername = username.toLowerCase();
  if (username !== normalizedUsername) {
    const url = new URL(request.url);
    url.pathname = `/profile/${normalizedUsername}`;
    return Response.redirect(url, 308);
  }

  const result = await userService.findByUsername(normalizedUsername);
  if (!result.ok) {
    return new Response(
      result.error.code === "NOT_FOUND" ? "Brukeren finnes ikke" : "Kunne ikke laste profilen",
      { status: result.error.code === "NOT_FOUND" ? 404 : 500 }
    );
  }

  const profile = result.data;
  const drawings = await drawingService.listPublicDrawingsByUser(profile.id);

  return (
    <section className="min-h-[80vh] bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
          <p className="mt-2 text-sm text-gray-500">Se de offentlige tegningene til @{profile.username}.</p>
        </header>
        <ProfileHeader profile={profile} />
        <ProfileDrawings result={drawings} />
      </div>
    </section>
  );
}


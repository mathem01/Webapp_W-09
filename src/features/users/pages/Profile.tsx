import type { RequestInfo } from "rwsdk/worker";
import { service as userService } from "../user-service";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileDrawings } from "../components/ProfileDrawings";
import { Suspense } from "react";
import { DrawingGridSkeleton } from "@/features/drawings/components/DrawingGridSkeleton";

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
  
   /* Sidetall og sidestørrelse står i URL-en, så en side kan bokmerkes og
     deles. Mangler limit, bestemmer servicen standardverdien. */
  const query = new URL(request.url).searchParams;
  const page = Number(query.get("page") ?? 1);
  const limit = query.get("limit") ? Number(query.get("limit")) : undefined;

  return (
    <section className="min-h-[80vh] bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
          <p className="mt-2 text-sm text-gray-500">Se de offentlige tegningene til @{profile.username}.</p>
        </header>
        <ProfileHeader profile={profile} />

        <section aria-labelledby="drawings-heading" className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <header className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Offentlige tegninger</h2>
            <p className="mt-1 text-sm text-gray-500">Her vises tegningene brukeren har publisert.</p>
          </header>

          <Suspense fallback={<DrawingGridSkeleton />}>
                <ProfileDrawings
              userId={profile.id}
              page={page}
              limit={limit}
              basePath={`/profile/${normalizedUsername}`}
            />
          </Suspense>
        </section>
      </div>
    </section>
  );
}


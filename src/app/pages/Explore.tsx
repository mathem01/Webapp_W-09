import type { RequestInfo } from "rwsdk/worker";
import { Suspense } from "react";
import { ExploreDrawings } from "@/features/drawings/components/ExploreDrawings";
import { DrawingGridSkeleton } from "@/features/drawings/components/DrawingGridSkeleton";

export async function Explore({ ctx, request }: RequestInfo) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? 1);

  return (
    <section className="min-h-[calc(100vh-8rem)] bg-neutral-100 px-4 py-6">
      <header className="mx-auto mb-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-neutral-900">Utforsk tegninger</h1>
        <p className="mt-2 text-sm text-neutral-600">Oppdag tegninger som brukerne har delt offentlig.</p>
      </header>
      <Suspense fallback={<DrawingGridSkeleton variant="explore" />}>
        <ExploreDrawings viewerUserId={ctx.session.userId} page={page} />
      </Suspense>
    </section>
  );
}

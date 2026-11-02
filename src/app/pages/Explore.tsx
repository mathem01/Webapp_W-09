import type { RequestInfo } from "rwsdk/worker";
import { ExploreGrid } from "@/components/ExploreGrid";
import { service } from "@/features/drawings/drawing-instances";

export async function Explore({ ctx }: RequestInfo) {
  const result = await service.listPublicDrawings(20);
  return (
    <section className="min-h-[calc(100vh-8rem)] bg-neutral-100 px-4 py-6">
      <header className="mx-auto mb-6 max-w-5xl">
        <h1 className="text-2xl font-bold text-neutral-900">Utforsk tegninger</h1>
        <p className="mt-2 text-sm text-neutral-600">Oppdag tegninger som brukerne har delt offentlig.</p>
      </header>
      {!result.ok ? (
        <div role="alert" className="mx-auto max-w-5xl rounded-xl bg-red-50 p-5 text-sm text-red-800">
          <p>Kunne ikke hente tegningene.</p>
          <a href="/explore" className="mt-2 inline-block font-medium underline">Prøv igjen</a>
        </div>
      ) : <ExploreGrid drawings={result.data} viewerUserId={ctx.session.userId} />}
    </section>
  );
}

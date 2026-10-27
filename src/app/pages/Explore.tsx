import { DrawingGrid } from "@/features/drawings/components/DrawingGrid";
import { service } from "@/features/drawings/drawing-service";

export async function Explore() {
  const result = await service.listPublicDrawings(20);

  if (!result.ok) {
    return <p className="p-5">Kunne ikke hente tegninger.</p>;
  }

  return (
    <section className="p-5">
      <h1 className="mb-4 text-xl font-semibold">Utforsk nye tegninger</h1>
      <DrawingGrid
        drawings={result.data}
        emptyText="Ingen har publisert noe ennå."
      />
    </section>
  );
}
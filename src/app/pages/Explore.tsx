import { ExploreGrid, type ExploreDrawing } from "@/components/ExploreGrid";

const drawings: ExploreDrawing[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: "tegning",
  creator: "John",
  likes: 10,
  comments: [{ id: 1, author: "john", text: "fint bilde" }],
}));

export function Explore() {
  return (
    <section className="min-h-[calc(100vh-8rem)] bg-neutral-100 px-4 py-6">
      <ExploreGrid drawings={drawings} />
    </section>
  );
}

// import { DrawingGrid } from "@/features/drawings/components/DrawingGrid";
// import { service } from "@/features/drawings/drawing-instances";

// export async function Explore() {
//   const result = await service.listPublicDrawings(20);

//   if (!result.ok) {
//     return <p className="p-5">Kunne ikke hente tegninger.</p>;
//   }

//   return (
//     <section className="p-5">
//       <h1 className="mb-4 text-xl font-semibold">Utforsk nye tegninger</h1>
//       <DrawingGrid
//         drawings={result.data}
//         emptyText="Ingen har publisert noe ennå."
//       />
//     </section>
//   );
// }

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

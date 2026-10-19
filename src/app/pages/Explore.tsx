const drawings = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: "Tittel på tegning",
  creator: "Skaper navn",
}));

export function Explore() {
  return (
    <section className="min-h-[calc(100vh-8rem)] bg-neutral-100 px-4 py-6">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {drawings.map((drawing) => (
          <a
            key={drawing.id}
            href={`/drawing/${drawing.id}`}
            className="rounded-md border border-neutral-300 bg-white p-2 shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-[4/3] rounded-md bg-neutral-300">
              <span className="absolute right-1.5 top-1 text-lg">❤️</span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div className="size-7 shrink-0 rounded bg-neutral-300" />
              <div className="leading-tight">
                <p className="text-xs font-semibold text-neutral-900">{drawing.title}</p>
                <p className="text-[10px] text-neutral-700">{drawing.creator}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
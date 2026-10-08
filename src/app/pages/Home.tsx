export function Home() {
  return (
    <section className="bg-neutral-2000 p-3">
      <div className="flex min-h-[40rem] justify-between bg-neutral-300 p-5">
        <div className="w-50">
          <div className="aspect-[4/3] rounded-md bg-neutral-200" />
          <div className="flex items-center justify-between rounded-b-md bg-neutral-400 px-3 py-1.5 text-sm text-white">
            <span>tegning</span>
            <a
              href="/canvas/1"
              className="rounded bg-neutral-200 px-3 py-0.5 text-neutral-900 transition hover:bg-neutral-100">
              Åpne
            </a>
          </div>
        </div>

        <a
          href="/canvas/1"
          className="flex h-fit flex-col items-center gap-1 text-xs text-neutral-700">
          <span className="flex size-14 items-center justify-center rounded-full bg-green-500 text-4xl font-bold text-white transition hover:bg-green-600">
            +
          </span>
          Lag ny tegning
        </a>
      </div>
    </section>
  );
}

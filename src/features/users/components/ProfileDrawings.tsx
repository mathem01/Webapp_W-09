import type { Result } from "@/lib/result";
import type { DrawingView } from "@/features/drawings/drawing-types";
import { DrawingGrid } from "@/features/drawings/components/DrawingGrid";

export function ProfileDrawings({ result }: { result: Result<DrawingView[]> }) {
  return (
    <section aria-labelledby="drawings-heading" className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="drawings-heading" className="text-xl font-semibold text-gray-900">Offentlige tegninger</h2>
          <p className="mt-1 text-sm text-gray-500">Her vises tegningene brukeren har publisert.</p>
        </div>
        {result.ok && <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700">{result.data.length} {result.data.length === 1 ? "tegning" : "tegninger"}</span>}
      </div>
      {!result.ok ? (
        <p role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-800">Kunne ikke hente tegningene. Prøv å laste siden på nytt.</p>
      ) : result.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <h3 className="font-medium text-gray-900">Ingen offentlige tegninger ennå</h3>
          <p className="mt-2 text-sm text-gray-500">Når brukeren publiserer tegninger, vises de her.</p>
        </div>
      ) : <DrawingGrid drawings={result.data} />}
    </section>
  );
}

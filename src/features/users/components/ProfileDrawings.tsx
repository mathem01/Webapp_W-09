import type { Result } from "@/lib/result";
import type { DrawingView } from "@/features/drawings/drawing-types";
import { service as drawingService } from "@/features/drawings/drawing-service";
import { DrawingGrid } from "@/features/drawings/components/DrawingGrid";

type Props = {
  userId: string;
};

export async function ProfileDrawings({ userId }: Props) {
  const result = await drawingService.listPublicDrawingsByUser(userId);

  if (!result.ok) {
    return (
      <p
        role="alert"
        className="rounded-xl bg-red-50 p-5 text-sm text-red-800"
      >
        Kunne ikke hente tegningene. Prøv å laste siden på nytt.
      </p>
    );
  }

  const drawings = result.data;

  if (drawings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
        <h3 className="font-medium text-gray-900">
          Ingen offentlige tegninger ennå
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Når brukeren publiserer tegninger, vises de her.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-gray-500">
        {drawings.length}{" "}
        {drawings.length === 1 ? "tegning" : "tegninger"}
      </p>

      <DrawingGrid drawings={drawings} />
    </>
  );
}

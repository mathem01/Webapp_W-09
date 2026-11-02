import type { DrawingView } from "@/features/drawings/drawing-types";
import { PixelPreview } from "./PixelPreview";
import { DrawingOptions } from "./DrawingOptions";

type Props = {
  drawings: DrawingView[];
  emptyText?: string;
  editable?: boolean;
};

 /* Viser en liste tegninger som et rutenett med forhåndsvisninger.
 */
export function DrawingGrid({
  drawings,
  editable = false,
  emptyText = "Ingen tegninger ennå.",
}: Props) {
  if (drawings.length === 0) {
    return <p className="text-sm text-neutral-500">{emptyText}</p>;
  }

  return (
    <ul className="grid grid-cols-1 items-start gap-4 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {drawings.map((drawing) => (
        <li
          key={drawing.id}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <PixelPreview
            pixels={drawing.pixels}
            width={drawing.width}
            height={drawing.height}
          />
          {editable ? (
            <DrawingOptions drawingId={drawing.id} title={drawing.title} isPublic={drawing.isPublic} />
          ) : (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 text-sm">
            <span className="truncate">{drawing.title}</span>
            <a
              href={`/drawing/${drawing.id}`}
              className="rounded bg-neutral-300 px-2 py-0.5 transition hover:bg-neutral-100">
              Åpne
            </a>
          </div>
          )}
        </li>
      ))}
    </ul>
  );
}

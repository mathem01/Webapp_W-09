import type { DrawingView } from "@/features/drawings/drawing-service";
import { PixelPreview } from "./PixelPreview";

type Props = {
  drawings: DrawingView[];
  emptyText?: string;
};

 /* Viser en liste tegninger som et rutenett med forhåndsvisninger.
 */
export function DrawingGrid({
  drawings,
  emptyText = "Ingen tegninger ennå.",
}: Props) {
  if (drawings.length === 0) {
    return <p className="text-sm text-neutral-500">{emptyText}</p>;
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {drawings.map((drawing) => (
        <li
          key={drawing.id}
          className="overflow-hidden rounded-md bg-neutral-200">
          <PixelPreview
            pixels={drawing.pixels}
            width={drawing.width}
            height={drawing.height}
          />
          <div className="flex items-center justify-between px-3 py-1.5 text-sm">
            <span className="truncate">{drawing.title}</span>
            <a
              href={`/drawing/${drawing.id}`}
              className="rounded bg-neutral-300 px-2 py-0.5 transition hover:bg-neutral-100">
              Åpne
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
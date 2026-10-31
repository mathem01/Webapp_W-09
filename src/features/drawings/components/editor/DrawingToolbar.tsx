"use client";

import { DRAWING_TOOLS } from "../../utils/drawing-tools";
import { ColorSelection } from "./ColorSelection";

const ICONS: Record<string, string> = {
  pencil: "✏️",
  eraser: "🧽",
  fill: "🪣",
  colorpicker: "💧",
  pan: "✋",
};

export function DrawingToolbar() {
  return (
    <aside
      className="z-10 flex w-16 shrink-0 flex-col items-center gap-2 border-r bg-white p-2"
    >
      <div role="group" className="flex flex-col gap-1">
        {DRAWING_TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            title={tool.label}
            className="grid size-10 place-items-center rounded text-xl transition hover:bg-slate-200"
          >
            {ICONS[tool.id]}
          </button>
        ))}
      </div>

      <div className="my-1 h-px w-full bg-gray-200" />

      <ColorSelection />
    </aside>
  );
}

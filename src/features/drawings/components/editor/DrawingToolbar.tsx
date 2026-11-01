"use client";

import { DrawingEditorState } from "../../hooks/useDrawingEditor";
import { DRAWING_TOOLS } from "../../utils/drawing-tools";
import { ColorSelection } from "./ColorSelection";

const ICONS: Record<string, string> = {
  pencil: "✏️",
  eraser: "🧽",
  fill: "🪣",
  colorpicker: "💧",
  pan: "✋",
  empty: "🗑️"
};

type Props = {
  editor: DrawingEditorState;
};

export function DrawingToolbar({ editor }: Props) {
  const { selectedColor, setColor } = editor

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

      <ColorSelection
        color={selectedColor}
        onChange={setColor}
      />

      <div className="my-1 h-px w-full bg-gray-200" />

      <button
        key={"empty"}
        type="button"
        title={"Tøm"}
        onClick={editor.emptyDrawing}
        className="size-10 rounded text-xl transition hover:bg-slate-200"
      >
        {ICONS["empty"]}
      </button>
    </aside>
  );
}

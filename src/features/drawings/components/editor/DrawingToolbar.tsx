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
  const { selectedTool, setTool, selectedColor, setColor } = editor

  return (
    <aside
      className="z-10 flex w-16 shrink-0 flex-col items-center gap-2 border-r bg-white p-2"
    >
      <div role="group" className="flex flex-col gap-1">
        {DRAWING_TOOLS.map(({id, label}) => (
          <button
            key={id}
            type="button"
            title={label}
            onClick={() => setTool(id)}
            className={`grid size-10 place-items-center rounded text-xl transition hover:bg-slate-200 ${
              selectedTool === id ? "bg-blue-100 ring-2 ring-blue-500" : ""
            }`}
          >
            {ICONS[id]}
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

"use client";

import { useState } from "react";
import type { DrawingEditorState } from "../../hooks/useDrawingEditor";
import type { DrawingAutosaveState } from "../../hooks/useDrawingAutosave";
import { drawingTitleSchema, firstIssue } from "../../drawing-schema";

type Props = {
  editor: DrawingEditorState;
  autosave: DrawingAutosaveState;
};

export function DrawingMenuBar({ editor, autosave }: Props) {
  const [title, setTitle] = useState(editor.drawing.title);
  const [error, setError] = useState<string | null>(null);
  const { updateTitle } = editor;

  const validateTitle = (value: string) => {
    const parsed = drawingTitleSchema.safeParse(value);
    setError(null);

    if (!parsed.success) {
      setError(firstIssue(parsed.error));
      setTitle(editor.drawing.title)
    } else {
      updateTitle(parsed.data);
      setTitle(parsed.data)
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      validateTitle(e.currentTarget.value);
      e.currentTarget.blur();
    }
  };

  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b bg-white px-4 py-2 text-sm">
      <nav className="flex gap-2">
        <button
          type="button"
          disabled
          className="rounded px-2 py-1 hover:bg-slate-200 disabled:opacity-40"
        >
          ↶ Angre
        </button>

        <button
          type="button"
          disabled
          className="rounded px-2 py-1 hover:bg-slate-200 disabled:opacity-40"
        >
          ↷ Gjør om
        </button>
      </nav>

      <div className="relative flex items-center justify-center gap-4">
        <input
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={(e) => validateTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-48 rounded border border-transparent px-2 py-1 text-center font-semibold hover:border-gray-300 focus:border-blue-500 focus:outline-none"
        />

        <div className="absolute left-full ml-3 flex items-center gap-2 whitespace-nowrap">
          <span className="w-20 shrink-0 text-left text-gray-500">
            {autosave.status === "saved" && "Lagret ✓"}
            {(autosave.status === "saving" || autosave.status === "unsaved") && "Lagrer..."}
            {autosave.status === "error" && "Error"}
          </span>

          <span className={`w-40 shrink-0 truncate text-left ${autosave.status === "error"
                ? "text-red-600"
                : "text-gray-500"
              }`}
            title={autosave.error ?? undefined}
          >
            {(autosave.status === "saving" || autosave.status === "unsaved") && "Ulagrede endringer"}
            {autosave.status === "error" &&
              (autosave.error ?? "Kunne ikke lagre")}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          className="rounded px-2 py-1 hover:bg-slate-200"
        >
          −
        </button>

        <span className="min-w-14 text-center tabular-nums">
          100%
        </span>

        <button
          type="button"
          className="rounded px-2 py-1 hover:bg-slate-200"
        >
          +
        </button>
      </div>
    </header>
  );
}

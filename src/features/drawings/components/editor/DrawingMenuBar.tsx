"use client";

import { useState } from "react";
import type { DrawingEditorState } from "../../hooks/useDrawingEditor";
import { drawingTitleSchema, firstIssue } from "../../drawing-schema";

type Props = {
  editor: DrawingEditorState;
};

export function DrawingMenuBar({ editor }: Props) {
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
          disabled={true}
          className="rounded px-2 py-1 hover:bg-slate-200 disabled:opacity-40"
        >
          ↶ Angre
        </button>

        <button
          type="button"
          disabled={true}
          className="rounded px-2 py-1 hover:bg-slate-200 disabled:opacity-40"
        >
          ↷ Gjør om
        </button>
      </nav>

      <div className="flex items-center justify-end gap-2">
        <input
          value={title}
          maxLength={100}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={(e) => validateTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-48 rounded border border-transparent px-2 py-1 text-center font-semibold hover:border-gray-300 focus:border-blue-500 focus:outline-none"
        />

        <span className="text-right">Lagret ✔️</span>
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

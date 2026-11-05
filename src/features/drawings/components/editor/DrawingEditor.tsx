"use client";

import type { DrawingInput } from "../../drawing-schema";
import { useDrawingEditor } from "../../hooks/useDrawingEditor";

import { DrawingCanvas } from "./DrawingCanvas";
import { DrawingToolbar } from "./DrawingToolbar";
import { DrawingMenuBar } from "./DrawingMenuBar";
import { DrawingStatusBar } from "./DrawingStatusBar";
import { useDrawingAutosave } from "../../hooks/useDrawingAutosave";
import { useEffect } from "react";

type Props = {
  initialDrawing: DrawingInput;
  initialDrawingId: string | null;
};

export function DrawingEditor({ initialDrawing, initialDrawingId }: Props) {
  const editor = useDrawingEditor(initialDrawing);
  const autosave = useDrawingAutosave({
        drawing: editor.drawing,
        revision: editor.revision,
        initialDrawingId,
    });

  useEffect(() => {
        if (initialDrawingId !== null) return;
        if (!autosave.drawingId) return;

        const url = new URL(window.location.href);
        url.pathname = `/canvas/${encodeURIComponent(autosave.drawingId)}`;
        window.history.replaceState(window.history.state, "", url);
        
    }, [initialDrawingId, autosave.drawingId]);

  return (
    <section className="flex h-[80vh] min-h-[32rem] flex-col overflow-hidden border bg-white text-sm">
      <DrawingMenuBar editor={editor} autosave={autosave} />

      <div className="flex min-h-0 flex-1">
        <DrawingToolbar editor={editor} />

        <main className="relative min-h-0 min-w-0 flex-1">
          <DrawingCanvas editor={editor} />
        </main>
      </div>

      <DrawingStatusBar editor={editor} />
    </section>
  );
}

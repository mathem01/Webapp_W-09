"use client";

import type { DrawingInput } from "../../drawing-schema";
import { useDrawingEditor } from "../../hooks/useDrawingEditor";

import { DrawingCanvas } from "./DrawingCanvas";
import { DrawingToolbar } from "./DrawingToolbar";
import { DrawingMenuBar } from "./DrawingMenuBar";
import { DrawingStatusBar } from "./DrawingStatusBar";

type Props = {
  initialDrawing: DrawingInput;
};

export function DrawingEditor({ initialDrawing }: Props) {
  const editor = useDrawingEditor(initialDrawing);

  return (
    <section className="flex h-[80vh] min-h-[32rem] flex-col overflow-hidden border bg-white text-sm">
      <DrawingMenuBar editor={editor} />

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

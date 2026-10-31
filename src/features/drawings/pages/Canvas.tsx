import { DrawingCanvas } from "../components/editor/DrawingCanvas";
import { DrawingMenuBar } from "../components/editor/DrawingMenuBar";
import { DrawingStatusBar } from "../components/editor/DrawingStatusBar";
import { DrawingToolbar } from "../components/editor/DrawingToolbar";

export function Canvas() {
  return (
    <section className="flex h-[80vh] min-h-[32rem] flex-col overflow-hidden border bg-white text-sm">
      <DrawingMenuBar />

      <div className="flex min-h-0 flex-1">
        <DrawingToolbar />

        <main className="relative min-h-0 min-w-0 flex-1">
          <DrawingCanvas />
        </main>
      </div>

      <DrawingStatusBar />
    </section>
  );
}
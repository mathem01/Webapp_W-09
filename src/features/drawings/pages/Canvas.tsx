import { DrawingMenuBar } from "../components/editor/DrawingMenuBar";
import { DrawingStatusBar } from "../components/editor/DrawingStatusBar";
import { DrawingToolbar } from "../components/editor/DrawingToolbar";

export function Canvas() {
  return (
    <section className="flex h-[80vh] min-h-[32rem] flex-col text-sm">
      <DrawingMenuBar />

      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-neutral-700 p-8">
        <DrawingToolbar />
        <div className="aspect-square h-full max-w-full bg-white" />
      </div>

      
      <DrawingStatusBar />
    </section>
  );
}
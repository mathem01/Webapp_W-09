import { DrawingToolbar } from "../components/editor/DrawingToolbar";

export function Canvas() {
  return (
    <section className="flex h-[80vh] min-h-[32rem] flex-col text-sm">
      <div className="grid grid-cols-3 items-center border-b bg-white px-6 py-2 text-base font-semibold">
        <div className="flex gap-1 [&_span]:cursor-pointer [&_span]:rounded [&_span]:px-2 [&_span]:py-1 [&_span]:transition [&_span:hover]:bg-slate-200">
          <span>Fil</span>
          <span>Rediger</span>
          <span>Vis</span>
          <span>Bilde</span>
        </div>
        <span className="text-center">Tittel på tegning</span>
        <span className="text-right">Lagret ✔️</span>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center bg-neutral-700 p-8">
        <DrawingToolbar />
        <div className="aspect-square h-full max-w-full bg-white" />
      </div>

      
      <div className="flex items-center gap-7 bg-gray-500 px-5 py-1.5 font-semibold [&_span]:cursor-pointer [&_span]:rounded [&_span]:py-1 [&_span]:transition [&_span:hover]:bg-slate-200">
        <span>verktøytips</span>
        <span className="ml-auto">oppløsning</span>
        <span>zoom</span>
      </div>
    </section>
  );
}
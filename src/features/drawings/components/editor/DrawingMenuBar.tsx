"use client";

export function DrawingMenuBar() {
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
          value={"Ny tegning"}
          maxLength={100}
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

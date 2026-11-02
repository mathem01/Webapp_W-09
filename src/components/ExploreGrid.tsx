"use client";

import { useState } from "react";

const drawingImage = "/ekko.jpg";
const artistImage = "/jinx.jpeg";

export type ExploreDrawing = {
  id: number;
  title: string;
  creator: string;
  likes: number;
  comments: { id: number; author: string; text: string }[];
};

export function ExploreGrid({ drawings }: { drawings: ExploreDrawing[] }) {
  const [open, setOpen] = useState<ExploreDrawing | null>(null);

  return (
    <>
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {drawings.map((drawing) => (
          <button
            key={drawing.id}
            type="button"
            onClick={() => setOpen(drawing)}
            className="rounded-md border border-neutral-300 bg-white p-2 text-left shadow-sm transition hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-neutral-300">
              <img src={drawingImage} alt={drawing.title} className="size-full object-cover" />
              <span className="absolute right-1.5 top-1 flex items-center gap-1 text-sm">
                ❤️
                <span className="text-xs text-neutral-500">{drawing.likes}</span>
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <img src={artistImage} alt={drawing.creator} className="size-7 shrink-0 rounded object-cover" />
              <div className="leading-tight">
                <p className="text-xs font-semibold text-neutral-900">{drawing.title}</p>
                <p className="text-[10px] text-neutral-700">{drawing.creator}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl md:flex-row"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-1 items-center justify-center bg-neutral-200 p-4">
              <img src={drawingImage} alt={open.title} className="aspect-square w-full max-w-md rounded-md object-cover" />
            </div>

            <div className="flex w-full flex-col md:w-80">
              <div className="flex items-center gap-2 border-b p-3">
                <img src={artistImage} alt={open.creator} className="size-8 shrink-0 rounded object-cover" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-neutral-900">{open.title}</p>
                  <p className="text-xs text-neutral-700">{open.creator}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="ml-auto rounded px-2 py-1 text-lg transition hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>

              <ul className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
                {open.comments.map((c) => (
                  <li key={c.id}>
                    <span className="font-semibold">{c.author}</span> {c.text}
                  </li>
                ))}
              </ul>

              <div className="border-t p-3">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded px-2 py-1 text-sm font-semibold transition hover:bg-slate-200"
                >
                  <span className="text-xl">❤️</span>
                  {open.likes} likes
                </button>

                <div className="mt-2 flex gap-2">
                  <input
                    placeholder="Skriv en kommentar..."
                    className="w-full rounded bg-slate-100 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-slate-300"
                  />
                  <button
                    type="button"
                    className="rounded bg-green-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

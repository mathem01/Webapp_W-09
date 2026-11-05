"use client";

import { useState } from "react";
import type { PublicDrawingView } from "@/features/drawings/drawing-types";
import { PixelPreview } from "@/features/drawings/components/PixelPreview";
import { DrawingDetailsModal } from "@/components/ExplorererDrawingComments";

type Props = {
  drawings: PublicDrawingView[];
  viewerUserId: string | null;
};

export function ExploreGrid({
  drawings,
  viewerUserId,
}: Props) {
  const [selectedDrawing, setSelectedDrawing] =
    useState<PublicDrawingView | null>(null);

  if (drawings.length === 0) {
    return (
      <p className="mx-auto max-w-5xl rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-sm text-neutral-600">
        Ingen offentlige tegninger ennå.
      </p>
    );
  }

  return (
    <>
      <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-5 min-[400px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {drawings.map((drawing) => {
          const profileUrl =
            drawing.owner.id === viewerUserId
              ? "/myPage"
              : `/profile/${drawing.owner.username}`;

          return (
            <li
              key={drawing.id}
              className="min-w-0 rounded-md border border-neutral-300 bg-white p-2 shadow-sm transition hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setSelectedDrawing(drawing)}
                aria-label={`Åpne ${drawing.title}`}
                className="block w-full rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                <PixelPreview
                  pixels={drawing.pixels}
                  width={drawing.width}
                  height={drawing.height}
                />
              </button>

              <div className="mt-2 flex items-center gap-2">
                <a
                  href={profileUrl}
                  aria-label={`Se profilen til ${drawing.owner.username}`}
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 transition hover:bg-indigo-200 focus-visible:outline-2 focus-visible:outline-indigo-600"
                >
                  <span aria-hidden="true">
                    {drawing.owner.username.charAt(0).toUpperCase()}
                  </span>
                </a>

                <div className="min-w-0 leading-tight">
                  <h2 className="break-words text-sm font-semibold text-neutral-900">
                    {drawing.title}
                  </h2>

                  <a
                    href={profileUrl}
                    className="mt-1 block break-words text-xs text-neutral-600 hover:underline"
                  >
                    @{drawing.owner.username}
                  </a>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <DrawingDetailsModal
        drawing={selectedDrawing}
        viewerUserId={viewerUserId}
        onClose={() => setSelectedDrawing(null)}
      />
    </>
  );
}
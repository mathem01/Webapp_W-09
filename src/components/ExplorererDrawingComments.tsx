"use client";

import { useEffect } from "react";
import type { PublicDrawingView } from "@/features/drawings/drawing-types";
import { PixelPreview } from "@/features/drawings/components/PixelPreview";

type Props = {
  drawing: PublicDrawingView | null;
  viewerUserId: string | null;
  onClose: () => void;
};

export function DrawingDetailsModal({
  drawing,
  viewerUserId,
  onClose,
}: Props) {
  useEffect(() => {
    if (!drawing) return;

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", closeWithEscape);

    return () => {
      window.removeEventListener("keydown", closeWithEscape);
    };
  }, [drawing, onClose]);

  if (!drawing) return null;

  const profileUrl =
    drawing.owner.id === viewerUserId
      ? "/myPage"
      : `/profile/${drawing.owner.username}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawing-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
    >
      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-[1.4fr_1fr]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Lukk tegningen"
          className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-white text-xl font-bold text-gray-700 shadow hover:bg-gray-100"
        >
          ×
        </button>

        <div className="flex items-center justify-center bg-neutral-100 p-5">
          <div className="w-full max-w-xl">
            <PixelPreview
              pixels={drawing.pixels}
              width={drawing.width}
              height={drawing.height}
            />
          </div>
        </div>

        <div className="flex min-h-80 flex-col p-5">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
            <a
              href={profileUrl}
              aria-label={`Se profilen til ${drawing.owner.username}`}
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 hover:bg-indigo-200"
            >
              <span aria-hidden="true">
                {drawing.owner.username.charAt(0).toUpperCase()}
              </span>
            </a>

            <div className="min-w-0">
              <a
                href={profileUrl}
                className="break-words text-sm font-semibold text-gray-900 hover:underline"
              >
                @{drawing.owner.username}
              </a>

              <h2
                id="drawing-modal-title"
                className="break-words text-lg font-bold text-gray-900"
              >
                {drawing.title}
              </h2>
            </div>
          </div>

          <div className="flex flex-1 items-center justify-center py-8 text-center">
            <p className="text-sm text-gray-500">
              Ingen kommentarer ennå.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <label
              htmlFor={`comment-${drawing.id}`}
              className="sr-only"
            >
              Skriv en kommentar
            </label>

            <input
              id={`comment-${drawing.id}`}
              type="text"
              disabled
              placeholder="Kommentarer kommer senere"
              className="min-h-11 w-full cursor-not-allowed rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-500"
            />

            
          </div>
        </div>
      </div>
    </div>
  );
}
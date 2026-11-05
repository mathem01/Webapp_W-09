"use client";

import { useEffect, useState } from "react";
import type { PublicDrawingView } from "@/features/drawings/drawing-types";
import { PixelPreview } from "@/features/drawings/components/PixelPreview";

type Comment = { id: number; author: string; text: string };

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
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [text, setText] = useState("");

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

  const id = drawing.id;
  const isLiked = liked.includes(id);
  const drawingComments = comments[id] ?? [];

  function toggleLike() {
    setLiked(isLiked ? liked.filter((x) => x !== id) : [...liked, id]);
    setLikes({ ...likes, [id]: (likes[id] ?? 0) + (isLiked ? -1 : 1) });
  }

  function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const comment = { id: Date.now(), author: "Deg", text: text.trim() };
    setComments({ ...comments, [id]: [...drawingComments, comment] });
    setText("");
  }

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

          <div className="flex-1 overflow-y-auto py-4">
            {drawingComments.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-500">
                Ingen kommentarer ennå.
              </p>
            ) : (
              <ul className="space-y-3 text-sm">
                {drawingComments.map((c) => (
                  <li key={c.id}>
                    <span className="font-semibold text-gray-900">{c.author}</span>{" "}
                    <span className="text-gray-700">{c.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={toggleLike}
              aria-pressed={isLiked}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              <span className="text-xl" aria-hidden="true">{isLiked ? "❤️" : "🤍"}</span>
              {likes[id] ?? 0} likes
            </button>

            <form onSubmit={addComment} className="mt-3 flex gap-2">
              <label htmlFor={`comment-${id}`} className="sr-only">
                Skriv en kommentar
              </label>
              <input
                id={`comment-${id}`}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Skriv en kommentar..."
                className="min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900"
              />
              <button
                type="submit"
                className="rounded-lg bg-green-500 px-4 text-sm font-semibold text-white transition hover:bg-green-600"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
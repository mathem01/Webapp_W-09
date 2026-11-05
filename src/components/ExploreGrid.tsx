"use client";

import { useState } from "react";
import type { PublicDrawingView } from "@/features/drawings/drawing-types";
import { PixelPreview } from "@/features/drawings/components/PixelPreview";

type Props = { drawings: PublicDrawingView[]; viewerUserId: string | null };
type Comment = { id: number; author: string; text: string };

export function ExploreGrid({ drawings, viewerUserId }: Props) {
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [text, setText] = useState("");

  const open = drawings.find((d) => d.id === openId);

  function toggleLike(id: string) {
    const isLiked = liked.includes(id);
    setLiked(isLiked ? liked.filter((x) => x !== id) : [...liked, id]);
    setLikes({ ...likes, [id]: (likes[id] ?? 0) + (isLiked ? -1 : 1) });
  }

  function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!open || !text.trim()) return;
    const comment = { id: Date.now(), author: "Deg", text: text.trim() };
    setComments({ ...comments, [open.id]: [...(comments[open.id] ?? []), comment] });
    setText("");
  }

  function profileUrl(drawing: PublicDrawingView) {
    return drawing.owner.id === viewerUserId ? "/myPage" : `/profile/${drawing.owner.username}`;
  }

  if (drawings.length === 0) {
    return <p className="mx-auto max-w-5xl rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-sm text-neutral-600">Ingen offentlige tegninger ennå.</p>;
  }

  return (
    <>
      <ul className="mx-auto grid max-w-5xl grid-cols-1 gap-5 min-[400px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        {drawings.map((drawing) => (
          <li key={drawing.id} className="min-w-0 rounded-md border border-neutral-300 bg-white p-2 shadow-sm transition hover:shadow-md">
            <button type="button" onClick={() => setOpenId(drawing.id)} className="relative block w-full" aria-label={`Åpne ${drawing.title}`}>
              <PixelPreview pixels={drawing.pixels} width={drawing.width} height={drawing.height} />
              <span className="absolute right-1.5 top-1 flex items-center gap-1 rounded bg-white/80 px-1 text-sm">
                {liked.includes(drawing.id) ? "❤️" : "🤍"}
                <span className="text-xs text-neutral-500">{likes[drawing.id] ?? 0}</span>
              </span>
            </button>
            <div className="mt-2 flex items-center gap-2">
              <a href={profileUrl(drawing)} aria-label={`Se profilen til ${drawing.owner.username}`} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 transition hover:bg-indigo-200">
                <span aria-hidden="true">{drawing.owner.username.charAt(0).toUpperCase()}</span>
              </a>
              <div className="min-w-0 leading-tight">
                <h2 className="break-words text-sm font-semibold text-neutral-900">{drawing.title}</h2>
                <a href={profileUrl(drawing)} className="mt-1 block break-words text-xs text-neutral-600 hover:underline">@{drawing.owner.username}</a>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOpenId(null)}>
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-xl md:flex-row" onClick={(e) => e.stopPropagation()}>
            <div className="flex flex-1 items-center justify-center bg-neutral-200 p-4">
              <div className="w-full max-w-md">
                <PixelPreview pixels={open.pixels} width={open.width} height={open.height} />
              </div>
            </div>

            <div className="flex w-full flex-col md:w-80">
              <div className="flex items-center gap-2 border-b p-3">
                <a href={profileUrl(open)} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                  {open.owner.username.charAt(0).toUpperCase()}
                </a>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-neutral-900">{open.title}</p>
                  <a href={profileUrl(open)} className="text-xs text-neutral-700 hover:underline">@{open.owner.username}</a>
                </div>
                <button type="button" onClick={() => setOpenId(null)} className="ml-auto rounded px-2 py-1 text-lg transition hover:bg-slate-200">
                  ✕
                </button>
              </div>

              <ul className="flex-1 space-y-3 overflow-y-auto p-3 text-sm">
                {(comments[open.id] ?? []).map((c) => (
                  <li key={c.id}>
                    <span className="font-semibold">{c.author}</span> {c.text}
                  </li>
                ))}
              </ul>

              <div className="border-t p-3">
                <button type="button" onClick={() => toggleLike(open.id)} className="flex items-center gap-2 rounded px-2 py-1 text-sm font-semibold transition hover:bg-slate-200">
                  <span className="text-xl">{liked.includes(open.id) ? "❤️" : "🤍"}</span>
                  {likes[open.id] ?? 0} likes
                </button>

                <form onSubmit={addComment} className="mt-2 flex gap-2">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Skriv en kommentar..."
                    className="w-full rounded bg-slate-100 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-1 focus:ring-slate-300"
                  />
                  <button type="submit" className="rounded bg-green-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-600">
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

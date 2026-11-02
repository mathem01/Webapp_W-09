"use client";

import { useId, useRef, useState } from "react";
import { z } from "zod";

const responseSchema = z.object({ ok: z.literal(true) });
type Props = { drawingId: string; title: string; isPublic: boolean };

export function DrawingOptions({ drawingId, title, isPublic }: Props) {
  const [visibility, setVisibility] = useState(isPublic);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  async function changeVisibility(nextVisibility: boolean) {
    if (pending.current || nextVisibility === visibility) return;
    pending.current = true;
    setIsPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/drawings/${encodeURIComponent(drawingId)}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: nextVisibility }),
      });
      if (!response.ok) {
        setError(response.status === 401
          ? "Du må logge inn igjen for å endre synligheten."
          : "Kunne ikke endre synligheten. Prøv igjen.");
        return;
      }
      const result = responseSchema.safeParse(await response.json());
      if (!result.success) {
        setError("Kunne ikke bekrefte lagringen. Last siden på nytt.");
        return;
      }
      setVisibility(nextVisibility);
    } catch {
      setError("Kunne ikke kontakte serveren. Prøv igjen.");
    } finally {
      pending.current = false;
      setIsPending(false);
    }
  }

  return (
    <div className="border-t border-gray-100 p-3" onKeyDown={(event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        toggle.current?.focus();
      }
    }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <a href={`/drawing/${encodeURIComponent(drawingId)}`} className="block break-words text-sm font-medium text-gray-900 hover:underline">{title}</a>
          <p aria-live="polite" className="mt-1 text-xs text-gray-600">
            {isPending ? "Lagrer…" : visibility ? "Offentlig" : "Privat"}
          </p>
        </div>
        <button ref={toggle} type="button" aria-label={`Valg for ${title}`} aria-expanded={isOpen} aria-controls={panelId}
          onClick={() => setIsOpen(!isOpen)}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-xl text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600">
          <span aria-hidden="true">⋯</span>
        </button>
      </div>
      <div id={panelId} hidden={!isOpen} className="mt-3 rounded-lg bg-gray-50 p-3">
        <fieldset disabled={isPending} aria-busy={isPending}>
          <legend className="mb-2 text-sm font-medium text-gray-900">Synlighet</legend>
          <div className="flex flex-wrap gap-2">
            {[{ label: "Privat", value: false }, { label: "Offentlig", value: true }].map((option) => (
              <button key={option.label} type="button" aria-pressed={visibility === option.value}
                onClick={() => changeVisibility(option.value)}
                className={`min-h-10 flex-1 rounded-md border px-3 py-2 text-sm transition disabled:cursor-wait disabled:opacity-60 ${visibility === option.value
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"}`}>
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-600">{visibility ? "Alle kan se tegningen." : "Bare du kan se tegningen."}</p>
        </fieldset>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}

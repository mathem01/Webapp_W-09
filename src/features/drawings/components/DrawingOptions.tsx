"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { z } from "zod";

const savedResponseSchema = z.object({ ok: z.literal(true) });

type Props = {
  drawingId: string;
  title: string;
  isPublic: boolean;
};

export function DrawingOptions({ drawingId, title, isPublic }: Props) {
  const [isDrawingPublic, setIsDrawingPublic] = useState(isPublic);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ref-en stopper også to raske klikk før React rekker å oppdatere knappene.
  const saveInProgress = useRef(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  async function changeVisibility(shouldBePublic: boolean) {
    if (saveInProgress.current || shouldBePublic === isDrawingPublic) {
      return;
    }

    saveInProgress.current = true;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Offentlig-knappen sender true. Privat-knappen sender false.
      const body = JSON.stringify({ isPublic: shouldBePublic });
      const url = `/api/v1/drawings/${encodeURIComponent(drawingId)}/visibility`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (!response.ok) {
        if (response.status === 401) {
          setErrorMessage("Du må logge inn igjen for å endre synligheten.");
        } else {
          setErrorMessage("Kunne ikke endre synligheten. Prøv igjen.");
        }
        return;
      }

      const responseBody: unknown = await response.json();
      const result = savedResponseSchema.safeParse(responseBody);
      if (!result.success) {
        setErrorMessage("Kunne ikke bekrefte lagringen. Last siden på nytt.");
        return;
      }

      // Vis den nye statusen først når serveren har bekreftet lagringen.
      setIsDrawingPublic(shouldBePublic);
    } catch {
      setErrorMessage("Kunne ikke kontakte serveren. Prøv igjen.");
    } finally {
      saveInProgress.current = false;
      setIsSaving(false);
    }
  }

  function closeMenuOnEscape(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && isMenuOpen) {
      setIsMenuOpen(false);
      menuButton.current?.focus();
    }
  }

  let statusText = "Privat";
  if (isDrawingPublic) statusText = "Offentlig";
  if (isSaving) statusText = "Lagrer…";

  // aria-pressed under forteller hvilken knapp som er valgt.
  const buttonStyle = "min-h-10 flex-1 rounded-md border px-3 py-2 text-sm transition disabled:cursor-wait disabled:opacity-60 aria-pressed:border-indigo-600 aria-pressed:bg-indigo-600 aria-pressed:text-white border-gray-300 bg-white text-gray-700 hover:bg-gray-100 aria-pressed:hover:bg-indigo-600";

  return (
    <div className="border-t border-gray-100 p-3" onKeyDown={closeMenuOnEscape}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <a href={`/drawing/${encodeURIComponent(drawingId)}`} className="block break-words text-sm font-medium text-gray-900 hover:underline">
            {title}
          </a>
          <p aria-live="polite" className="mt-1 text-xs text-gray-600">{statusText}</p>
        </div>
        <button
          ref={menuButton}
          type="button"
          aria-label={`Valg for ${title}`}
          aria-expanded={isMenuOpen}
          aria-controls={menuId}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-xl text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <span aria-hidden="true">⋯</span>
        </button>
      </div>

      <div id={menuId} hidden={!isMenuOpen} className="mt-3 rounded-lg bg-gray-50 p-3">
        <fieldset disabled={isSaving} aria-busy={isSaving}>
          <legend className="mb-2 text-sm font-medium text-gray-900">Synlighet</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => changeVisibility(false)}
              aria-pressed={!isDrawingPublic}
              className={buttonStyle}
            >
              Privat
            </button>
            <button
              type="button"
              onClick={() => changeVisibility(true)}
              aria-pressed={isDrawingPublic}
              className={buttonStyle}
            >
              Offentlig
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            {isDrawingPublic ? "Alle kan se tegningen." : "Bare du kan se tegningen."}
          </p>
        </fieldset>
      </div>

      {errorMessage && <p role="alert" className="mt-3 text-sm text-red-700">{errorMessage}</p>}
    </div>
  );
}

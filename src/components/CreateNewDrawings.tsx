"use client";

import { useActionState, useEffect, useState } from "react";
import {
  createDrawingFromForm,
  type CreateDrawingResult,
} from "@/features/drawings/actions";
import {
  MAX_SIZE,
  MAX_TITLE_LENGTH,
  MIN_SIZE,
} from "@/features/drawings/drawing-schema";

const initialState: CreateDrawingResult = {
  ok: true,
  data: { id: null },
};

export function CreateNewDrawings() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createDrawingFromForm, initialState);

  useEffect(() => {
    if (state.ok && state.data.id !== null) {
      window.location.href = `/canvas/${(state.data.id)}`;
    }
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mb-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Ny tegning
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-drawing-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 id="create-drawing-heading" className="text-xl font-semibold text-gray-900">
              Opprett ny tegning
            </h2>

            <form action={formAction} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Tittel
                <input
                  type="text"
                  name="title"
                  maxLength={MAX_TITLE_LENGTH}
                  required
                  autoFocus
                  className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-gray-700">
                  Bredde
                  <input type="number" name="width" defaultValue={64} min={MIN_SIZE} max={MAX_SIZE} step={1} required className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2" />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  Høyde
                  <input type="number" name="height" defaultValue={64} min={MIN_SIZE} max={MAX_SIZE} step={1} required className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2" />
                </label>
              </div>

              {!state.ok && <p role="alert" className="text-sm text-red-700">{state.error.message}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsOpen(false)} disabled={isPending} className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                  Avbryt
                </button>
                <button type="submit" disabled={isPending} className="min-h-11 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
                  {isPending ? "Oppretter …" : "Opprett tegning"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useActionState, useEffect } from "react";
import {
  deleteDrawing,
  type DeleteDrawingResult,
} from "@/features/drawings/actions";

type Props = {
  drawingId: string;
};

const initialState: DeleteDrawingResult = {
  ok: true,
  data: { id: "" },
};

export function DeleteDrawing({ drawingId }: Props) {
  const [state, formAction, isPending] = useActionState(
    deleteDrawing,
    initialState,
  );

  useEffect(() => {
    if (state.ok && state.data.id === drawingId) {
      window.location.reload();
    }
  }, [state, drawingId]);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Er du sikker på at du vil slette tegningen?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="drawingId" value={drawingId} />

      <button
        type="submit"
        disabled={isPending}
        aria-label="Slett tegning"
        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span aria-hidden="true">🗑️</span>
        {isPending ? "Sletter …" : "Slett tegning"}
      </button>

      {!state.ok && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {state.error.message}
        </p>
      )}
    </form>
  );
}

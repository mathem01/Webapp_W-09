"use client";
import { changeVisibility, ChangeVisibilityResult } from "@/features/drawings/actions";
import { useId, useRef, useState, useActionState } from "react";


type Props = { drawingId: string; title: string; isPublic: boolean };

export function DrawingOptions({ drawingId, title, isPublic }: Props) {

  const [isOpen, setIsOpen] = useState(false);

  const initialState: ChangeVisibilityResult = {
    ok: true,
    data: { visibility: isPublic },
  };

  const [state, formAction, isPending] = useActionState(changeVisibility, initialState);

  const previous = state.ok ? state.data : state.state;

  const toggle = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  return (
    <div className="border-t border-gray-100 p-3" onKeyDown={(event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        toggle.current?.focus();
      }
    }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <a href={`/canvas/${encodeURIComponent(drawingId)}`} className="block break-words text-sm font-medium text-gray-900 hover:underline">{title}</a>
          <p aria-live="polite" className="mt-1 text-xs text-gray-600">
            {previous.visibility ? "Offentlig" : "Privat"}
          </p>
        </div>

        <button ref={toggle} type="button" aria-label={`Valg for ${title}`} aria-expanded={isOpen} aria-controls={panelId}
          onClick={() => setIsOpen(!isOpen)}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-xl text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-indigo-600">
          <span aria-hidden="true">⋯</span>
        </button>
      </div>
      <div id={panelId} hidden={!isOpen} className="mt-3 rounded-lg bg-gray-50 p-3">
        <form action={formAction}>
          <input type="hidden" name="drawingId" value={drawingId} />
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-900">Synlighet</legend>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                name="isPublic"
                value="false"
                disabled={isPending}
                aria-pressed={!previous.visibility}
                className="min-h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition 
                hover:bg-gray-100 aria-pressed:border-indigo-600 aria-pressed:bg-indigo-600 aria-pressed:text-white aria-pressed:hover:bg-indigo-600 
                disabled:cursor-not-allowed disabled:opacity-50"
              >
                Privat
              </button>
              <button
                type="submit"
                name="isPublic"
                value="true"
                disabled={isPending}
                aria-pressed={previous.visibility}
                className="min-h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition 
               hover:bg-gray-100 aria-pressed:border-indigo-600 aria-pressed:bg-indigo-600 aria-pressed:text-white aria-pressed:hover:bg-indigo-600 
                disabled:cursor-not-allowed disabled:opacity-50"
              >
                Offentlig
              </button>


            </div>
            {!isPending && <p className="mt-2 text-xs text-gray-600">{previous.visibility ? "Alle kan se tegningen." : "Bare du kan se tegningen."}</p>}
            {isPending && <p className="mt-2 text-xs text-gray-600">Lagrer...</p>}

          </fieldset>
        </form>

      </div>
      {!state.ok && <p role="alert" className="mt-3 text-sm text-red-700">{state.error.message}</p>}
    </div>
  );
}






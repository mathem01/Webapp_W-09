"use client";

import { startTransition, useActionState, useEffect } from "react";
import type { DrawingInput } from "../drawing-schema";
import { saveDrawingAction, type SaveDrawingResult } from "../actions";

type Props = {
    drawing: DrawingInput;
    revision: number;
    initialDrawingId: string | null;
};

export function useDrawingAutosave({ drawing, revision, initialDrawingId }: Props) {
    const initialState: SaveDrawingResult = {
        ok: true,
        data: {
            id: initialDrawingId,
            savedRevision: 0,
            failedRevision: null,
        },
    };

    const [state, saveAction, isPending] = useActionState(saveDrawingAction, initialState);

    const previous = state.ok ? state.data : state.state;

    useEffect(() => {
        if (revision === 0) return;
        if (revision <= previous.savedRevision) return;
        if (isPending) return;

        if (previous.failedRevision === revision) return;

        const timeout = window.setTimeout(() => {
            startTransition(() => {
                saveAction({
                    drawing,
                    revision,
                });
            });
        }, 1000);

        return () => window.clearTimeout(timeout);
    }, [
        drawing,
        revision,
        previous.savedRevision,
        previous.failedRevision,
        isPending,
        saveAction,
    ]);

    const status = (() => {
        if (isPending) return "saving";
        if (!state.ok && previous.failedRevision === revision) return "error";
        if (revision > previous.savedRevision) return "unsaved";
        return "saved";
    })();

    return {
        status,
        error:
            status === "error" && !state.ok
                ? state.error.message
                : null,
        drawingId: previous.id,
        isPending,
    };
}

export type DrawingAutosaveState = ReturnType<typeof useDrawingAutosave>;
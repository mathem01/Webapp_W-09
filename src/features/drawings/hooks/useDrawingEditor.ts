"use client";

import { useRef, useState } from "react";
import type { DrawingInput } from "../drawing-schema";
import type {
    PixelUpdate,
    Point,
} from "../types/drawing-editor";
import {
    createEmptyPixels,
    getLinePixels,
    getPixelIndex,
    isInsideArea,
} from "../utils/pixels";

type Stroke = {
    last: Point;
    color: string;
    changed: boolean;
};

export function useDrawingEditor(initial: DrawingInput) {
    const [drawing, setDrawing] = useState(initial);
    const drawingRef = useRef(initial);

    const [selectedColor, setColor] = useState("#000000");
    const strokeRef = useRef<Stroke | null>(null);

    function updateTitle(title: string) {
        const current = drawingRef.current;
        const length = title.trim().length

        if (length > 0 && length <= 100) {
            drawingRef.current = {
                ...current,
                title,
            };

            setDrawing(drawingRef.current)
        }
    }

    function emptyDrawing() {
        if (strokeRef.current) return;

        const { pixels, width, height } = drawingRef.current

        if (pixels.every((pixel) => pixel === null)) {
            return;
        }

        const next: DrawingInput = {
            ...drawingRef.current,
            pixels: createEmptyPixels(width, height),
        };

        drawingRef.current = next;
        setDrawing(next);
    }

    function drawTo(point: Point): PixelUpdate[] {
        const stroke = strokeRef.current;
        if (!stroke) return [];

        const current = drawingRef.current;
        const pixels = [...current.pixels];
        const updates: PixelUpdate[] = [];

        const points = getLinePixels(stroke.last, point);

        for (const p of points) {
            if (!isInsideArea(
                p.x, p.y,
                current.width, current.height,
            )) {
                continue;
            }

            const index = getPixelIndex(
                p.x, p.y,
                current.width,
            );

            if (pixels[index] === stroke.color) continue;

            pixels[index] = stroke.color;
            updates.push({
                index,
                color: stroke.color,
            });
        }

        if (updates.length > 0) {
            drawingRef.current = {
                ...current,
                pixels,
            };

            stroke.changed = true;
        }

        stroke.last = point;

        return updates;
    }

    function beginStroke(point: Point): PixelUpdate[] {
        if (strokeRef.current) return [];

        const current = drawingRef.current;

        if (!isInsideArea(
            point.x,
            point.y,
            current.width,
            current.height,
        )) {
            return [];
        }

        strokeRef.current = {
            last: point,
            color: selectedColor,
            changed: false,
        };

        return drawTo(point);
    }

    function endStroke() {
        const stroke = strokeRef.current;
        if (!stroke) return;

        strokeRef.current = null;

        if (stroke.changed) {
            setDrawing(drawingRef.current);
        }
    }

    return {
        drawing,
        selectedColor,
        setColor,
        updateTitle,
        emptyDrawing,
        beginStroke,
        drawTo,
        endStroke,
    };
}

export type DrawingEditorState = ReturnType<
    typeof useDrawingEditor
>;

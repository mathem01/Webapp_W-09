"use client";

import { useRef, useState } from "react";
import type { DrawingInput } from "../drawing-schema";
import type {
    DrawingTool,
    PixelColor,
    PixelUpdate,
    Point,
} from "../types/drawing-editor";
import {
    createEmptyPixels,
    floodFill,
    getLinePixels,
    getPixelIndex,
    isInsideArea,
} from "../utils/pixels";

type Stroke = {
    last: Point;
    tool: DrawingTool;
    color: string;
    changed: boolean;
};

export function useDrawingEditor(initial: DrawingInput) {
    const [drawing, setDrawing] = useState(initial);
    const drawingRef = useRef(initial);

    const [selectedTool, setTool] = useState<DrawingTool>("pencil");
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

    function applyPixels(indices: number[], color: PixelColor): PixelUpdate[] {
        const current = drawingRef.current;
        let pixels = current.pixels;

        const updates: PixelUpdate[] = [];

        for (const index of indices) {
            if (index < 0 || index >= pixels.length) {
                continue;
            }

            if (pixels[index] === color) continue;

            if (pixels === current.pixels) {
                pixels = [...current.pixels];
            }

            pixels[index] = color;
            updates.push({ index, color });
        }

        if (updates.length > 0) {
            drawingRef.current = {
                ...current,
                pixels,
            }

            if (strokeRef.current) {
                strokeRef.current.changed = true;
            }
        }

        return updates;
    }

    function drawTo(point: Point): PixelUpdate[] {
        const stroke = strokeRef.current;
        if (!stroke) return [];

        if (stroke.tool === "fill") return [];

        const current = drawingRef.current;
        const color: PixelColor = stroke.tool === "eraser" ? null : stroke.color

        const indices = getLinePixels(stroke.last, point)
            .filter((p) => isInsideArea(p.x, p.y, current.width, current.height))
            .map((p) => getPixelIndex(p.x, p.y, current.width));

        const updates = applyPixels(indices, color);

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
            tool: selectedTool,
            color: selectedColor,
            changed: false,
        };

        if (selectedTool === "fill") {
            const indices = floodFill(
                current.pixels,
                current.width,
                current.height,
                point,
                selectedColor
            );
            return applyPixels(indices, selectedColor)
        }

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
        selectedTool,
        setTool,
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

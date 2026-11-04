"use client";

import { useEffect, useRef } from "react";
import type { PointerEvent } from "react";
import type { DrawingEditorState } from "../../hooks/useDrawingEditor";
import type { PixelUpdate, Point } from "../../types/drawing-editor";

type Props = {
  editor: DrawingEditorState;
};

export function DrawingCanvas({ editor }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activePointerRef = useRef<number | null>(null);

  const { drawing, beginStroke, endStroke, drawTo } = editor;
  const { width, height, pixels } = drawing

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    pixels.forEach((color, index) => {
      if (color === null) return;

      const x = index % width;
      const y = Math.floor(index / width);

      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    });
  }, [drawing]);

  function applyUpdates(updates: PixelUpdate[]) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (const update of updates) {
      const x = update.index % width;
      const y = Math.floor(update.index / width);

      if (update.color === null) {
        ctx.clearRect(x, y, 1, 1);
      } else {
        ctx.fillStyle = update.color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  function getPoint(e: PointerEvent<HTMLCanvasElement>): Point {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();

    return {
      x: Math.floor(
        (e.clientX - rect.left) *
        (canvas.width / rect.width)
      ),
      y: Math.floor(
        (e.clientY - rect.top) *
        (canvas.height / rect.height)
      )
    };
  }

  function handlePointerDown(e: PointerEvent<HTMLCanvasElement>) {
    if (activePointerRef.current !== null) return;
    if (!e.isPrimary || e.button !== 0) return;

    const point = getPoint(e);

    if (
      point.x < 0 || point.y < 0 ||
      point.x >= width || point.y >= height
    ) {
      return;
    }

    activePointerRef.current = e.pointerId;
    e.currentTarget.setPointerCapture(e.pointerId);

    applyUpdates(beginStroke(point));
  }

  function handlePointerMove(e: PointerEvent<HTMLCanvasElement>) {
    if (activePointerRef.current !== e.pointerId) {
      return;
    }

    applyUpdates(drawTo(getPoint(e)));
  }

  function finishPointer(e: PointerEvent<HTMLCanvasElement>) {
    if (activePointerRef.current !== e.pointerId) {
      return;
    }

    activePointerRef.current = null;
    endStroke();

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  function handleLostPointerCapture(e: PointerEvent<HTMLCanvasElement>) {
    if (activePointerRef.current !== e.pointerId) {
      return;
    }

    activePointerRef.current = null;
    endStroke();
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-700 touch-none">
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: `translate(-50%, -50%)`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
          onLostPointerCapture={handleLostPointerCapture}
          className="block cursor-crosshair touch-none"
          style={{
            width: width * 5,
            height: height * 5,
            imageRendering: "pixelated",
            backgroundColor: "white",
            backgroundImage: `
                    linear-gradient(45deg, #ddd 25%, transparent 25%),
                    linear-gradient(-45deg, #ddd 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #ddd 75%),
                    linear-gradient(-45deg, transparent 75%, #ddd 75%)
                `,
            backgroundSize: "16px 16px",
            backgroundPosition:
              "0 0, 0 8px, 8px -8px, -8px 0",
          }}
        />
      </div>
    </div>
  );
}

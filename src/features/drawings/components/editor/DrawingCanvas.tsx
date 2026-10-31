"use client";

import { useRef } from "react";

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = 100
  const height = 100

  return (
    <div className="relative h-full w-full overflow-hidden bg-neutral-700 touch-none">
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: `translate(-50%, -50%)`,
        }}
      >
        <div
          className="relative shadow-xl"
          style={{
            width: width,
            height: height,
            backgroundColor: "#ffffff",
            backgroundImage: `
              linear-gradient(45deg, #ddd 25%, transparent 25%),
              linear-gradient(-45deg, #ddd 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, #ddd 75%),
              linear-gradient(-45deg, transparent 75%, #ddd 75%)
            `,
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
          }}
        >
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="block h-full w-full pointer-events-none"
            style={{ imageRendering: "pixelated" }}
          />
        </div>
      </div>
    </div>
  );
}

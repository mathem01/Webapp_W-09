import type { DrawingInput } from "@/features/drawings/drawing-schema";
import type { PixelColor, Point } from "../types/drawing-editor";
/**
 * Pikslene lagres som JSON-tekst i databasen. Disse to funksjonene er det
 * eneste stedet formatet er kjent, så det kan byttes til noe mer kompakt
 * uten at resten av koden endres.
 */

export function serializePixels(pixels: DrawingInput["pixels"]): string {
    return JSON.stringify(pixels);
}
export function deserializePixels(stored: string): DrawingInput["pixels"] {
    return JSON.parse(stored);
}

export function getPixelIndex(x: number, y: number, width: number): number {
    return y * width + x;
}

export function createEmptyPixels(width: number, height: number): PixelColor[] {
    return Array(width * height).fill(null);
}

export function isInsideArea(x: number, y: number, width: number, height: number): boolean {
    return (
        x >= 0 && y >= 0 &&
        x < width && y < height
    )
}

export function getLinePixels(start: Point, end: Point): Point[] {
  const points: Point[] = [];

  let x = start.x;
  let y = start.y;

  const dx = Math.abs(end.x - start.x);
  const dy = Math.abs(end.y - start.y);

  const sx = x < end.x ? 1 : -1;
  const sy = y < end.y ? 1 : -1;

  let error = dx - dy;

  while (true) {
    points.push({ x, y });

    if (x === end.x && y === end.y) break;

    const e2 = 2 * error;

    if (e2 > -dy) {
      error -= dy;
      x += sx;
    }

    if (e2 < dx) {
      error += dx;
      y += sy;
    }
  }

  return points;
}
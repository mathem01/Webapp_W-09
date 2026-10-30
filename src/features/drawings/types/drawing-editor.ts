import type { DrawingInput } from "../drawing-schema";

export type DrawingTool =
  | "pencil"
  | "eraser"
  | "fill"
  | "colorpicker"
  | "pan";

export type PixelColor = DrawingInput["pixels"][number];

export type Point = {
  x: number;
  y: number;
};

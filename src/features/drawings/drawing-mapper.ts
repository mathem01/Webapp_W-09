import { type Drawing, drawings } from "@/db/schema";
import { deserializePixels } from "./utils/pixels";
import { DrawingView } from "./drawing-types";

export function toDrawingView(row: Drawing): DrawingView {
  return { ...row, pixels: deserializePixels(row.pixels) };
}
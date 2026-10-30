import type { DrawingTool } from "../types/drawing-editor";

export const DRAWING_TOOLS: {
  id: DrawingTool;
  label: string;
}[] = [
  { id: "pencil", label: "Blyant"},
  { id: "eraser", label: "Viskelær"},
  { id: "fill", label: "Fyll"},
  { id: "colorpicker", label: "Pipette"},
  { id: "pan", label: "Flytt"},
];

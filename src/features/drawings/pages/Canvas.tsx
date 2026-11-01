import { DrawingEditor } from "../components/editor/DrawingEditor";
import { DrawingInput } from "../drawing-schema";

const initialDrawing: DrawingInput = {
  title: "Ny tegning",
  width: 100,
  height: 100,
  pixels: Array(100 * 100).fill(null),
};

export function Canvas() {
  return (
    <DrawingEditor initialDrawing={initialDrawing} />
  );
}
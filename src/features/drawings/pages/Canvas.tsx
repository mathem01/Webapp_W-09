import { DrawingEditor } from "../components/editor/DrawingEditor";
import { DrawingInput } from "../drawing-schema";
import { createEmptyPixels } from "../utils/pixels";
import { service } from "../drawing-service";
import { RequestInfo } from "rwsdk/worker";

const baseDrawing: DrawingInput = {
  title: "Uten tittel",
  width: 64,
  height: 64,
  pixels: createEmptyPixels(64, 64),
}

export async function Canvas({ params, ctx }: RequestInfo) {
  const drawingId = params.id;
  const userId = ctx.session.userId;

  if (!drawingId) {
    return (
      <DrawingEditor initialDrawing={baseDrawing} initialDrawingId={null} />
    );
  }

  const result = await service.getDrawing(drawingId, userId)

  if (!result.ok || !result.data) {
    return <p>Tegningen finnes ikke.</p>;
  }

  const { title, width, height, pixels, id } = result.data

  const initialDrawing: DrawingInput = {
    title: title,
    width: width,
    height: height,
    pixels: pixels,
  }

  return (
    <DrawingEditor initialDrawing={initialDrawing} initialDrawingId={id} />
  );
}
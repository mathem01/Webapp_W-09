import { DrawingEditorState } from "../../hooks/useDrawingEditor";
import { DRAWING_TOOLS } from "../../utils/drawing-tools";

type Props = {
  editor: DrawingEditorState;
};

export function DrawingStatusBar({ editor }: Props) {
  const { width, height } = editor.drawing

  const selectedTool = DRAWING_TOOLS.find(
    (tool) => tool.id === editor.selectedTool,
  )

  return (
    <footer className="flex items-center gap-6 border-t bg-gray-100 px-4 py-2 text-xs">
      <span>
        Verktøy: {selectedTool ? selectedTool.label : "Ingen"}
      </span>

      <span className="ml-auto">
        {width} × {height} px
      </span>

      <span className="tabular-nums">
        Zoom: 100%
      </span>
    </footer>
  );
}

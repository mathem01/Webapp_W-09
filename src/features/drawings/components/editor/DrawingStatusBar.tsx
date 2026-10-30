export function DrawingStatusBar() {
  return (
    <footer className="flex items-center gap-6 border-t bg-gray-100 px-4 py-2 text-xs">
      <span>
        Verktøy: Blyant
      </span>

      <span className="ml-auto">
        100 × 100 px
      </span>

      <span className="tabular-nums">
        Zoom: 100%
      </span>
    </footer>
  );
}

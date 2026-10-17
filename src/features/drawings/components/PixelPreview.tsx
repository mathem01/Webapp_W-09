import type { DrawingInput } from "@/lib/drawing-validation";

type Props = {
  pixels: DrawingInput["pixels"];
  width: number;
  height: number;
};

/**
 * Viser et pikselarray som et bilde.
 *
 * Pikslene ligger radvis, så rute nummer `i` hører til rad `i / width`.
 * `null` betyr gjennomsiktig, og da tegner vi ingen farge.
 */
export function PixelPreview({ pixels, width, height }: Props) {
  return (
    <div
      className="grid aspect-square w-full overflow-hidden rounded-md bg-white"
      style={{
        gridTemplateColumns: `repeat(${width}, 1fr)`,
        gridTemplateRows: `repeat(${height}, 1fr)`,
      }}>
      {pixels.map((color, i) => (
        <div key={i} style={color ? { backgroundColor: color } : undefined} />
      ))}
    </div>
  );
}
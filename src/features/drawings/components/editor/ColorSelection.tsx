"use client";

const DEFAULT_COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#3b82f6", "#a855f7",
  "#ec4899", "#92400e",
];

export function ColorSelection() {
  return (
    <div className="grid grid-cols-2 gap-1">
      {DEFAULT_COLORS.map((value) => (
        <button
          key={value}
          type="button"
          title={value}
          className="size-5 rounded border border-gray-400 outline-offset-2"
          style={{ backgroundColor: value }}
        />
      ))}
    </div>
  );
}

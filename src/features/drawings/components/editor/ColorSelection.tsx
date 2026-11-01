"use client";

const DEFAULT_COLORS = [
  "#000000", "#ffffff", "#ef4444", "#f97316",
  "#eab308", "#22c55e", "#3b82f6", "#a855f7",
  "#ec4899", "#92400e",
];

type Props = {
  color: string;
  onChange: (color: string) => void;
};

export function ColorSelection({ color, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {DEFAULT_COLORS.map((value) => (
        <button
          key={value}
          type="button"
          title={value}
          onClick={() => onChange(value)}
          className={`size-5 rounded border border-gray-400 outline-offset-2 ${
            color === value ? "outline-2 outline-blue-500" : ""
          }`}
          style={{ backgroundColor: value }}
        />
      ))}
    </div>
  );
}

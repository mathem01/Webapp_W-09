"use client";

const DEFAULT_COLORS = [
  { value: "#000000", title: "Svart" },
  { value: "#ffffff", title: "Hvit" },
  { value: "#ef4444", title: "Rød" },
  { value: "#f97316", title: "Oransje" },
  { value: "#eab308", title: "Gul" },
  { value: "#22c55e", title: "Grønn" },
  { value: "#3b82f6", title: "Blå" },
  { value: "#a855f7", title: "Lilla" },
  { value: "#ec4899", title: "Rosa" },
  { value: "#92400e", title: "Brun" }
];

type Props = {
  color: string;
  onChange: (color: string) => void;
};

export function ColorSelection({ color, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-1">
      {DEFAULT_COLORS.map(({value, title}) => (
        <button
          key={value}
          type="button"
          title={title}
          onClick={() => onChange(value)}
          className={`size-5 rounded border border-gray-400 outline-offset-2 ${
            color === value ? "outline-2 outline-blue-500" : ""
          }`}
          style={{ backgroundColor: value }}
        />
      ))}

      <input
        type={"color"}
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="col-span-2 h-8 w-full cursor-pointer"
      />
    </div>
  );
}

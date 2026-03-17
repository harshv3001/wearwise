"use client";

export default function BeforeChip({
  label,
  selected = false,
  disabled = false,
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center rounded-full px-3 py-1 text-sm",
        "ring-1 ring-inset",
        selected ? "ring-zinc-600" : "ring-zinc-300",
        "hover:opacity-90 active:opacity-80",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {label}
    </button>
  );
}

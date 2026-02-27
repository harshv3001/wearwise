"use client";

export default function Button({
  children,
  type = "button",
  disabled = false,
  onClick,
  className = "",
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium",
        "ring-1 ring-inset ring-zinc-300",
        "hover:opacity-90 active:opacity-80",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
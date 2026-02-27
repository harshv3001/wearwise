"use client";

export default function SelectInput({
  label,
  name,
  value,
  onChange,
  options = [], // [{ label, value }]
  required = false,
  disabled = false,
  placeholder = "Select an option",
  error,
  className = "",
  selectClassName = "",
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label ? (
        <label className="block text-sm font-medium" htmlFor={name}>
          {label}
        </label>
      ) : null}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={[
          "w-full rounded-lg px-3 py-2 text-sm",
          "ring-1 ring-inset ring-zinc-300",
          "focus:outline-none focus:ring-2 focus:ring-zinc-400",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          selectClassName,
        ].join(" ")}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((opt) => (
          <option key={String(opt.value)} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error ? <p className="text-xs">{error}</p> : null}
    </div>
  );
}
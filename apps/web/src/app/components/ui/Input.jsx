"use client";

export default function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  disabled = false,
  autoComplete,
  error,
  helperText,
  className = "",
  inputClassName = "",
  ...rest
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label ? (
        <label className="block text-sm font-medium" htmlFor={name}>
          {label}
        </label>
      ) : null}

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className={[
          "w-full rounded-lg px-3 py-2 text-sm",
          "ring-1 ring-inset ring-zinc-300",
          "focus:outline-none focus:ring-2 focus:ring-zinc-400",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          inputClassName,
        ].join(" ")}
        {...rest}
      />

      {error ? (
        <p className="text-xs">{error}</p>
      ) : helperText ? (
        <p className="text-xs">{helperText}</p>
      ) : null}
    </div>
  );
}
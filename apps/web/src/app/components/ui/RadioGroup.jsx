"use client";

export default function RadioGroup({
  label,
  name,
  value,
  onChange, // receives event
  options = [], // [{ label, value }]
  required = false,
  disabled = false,
  error,
  className = "",
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label ? <div className="text-sm font-medium">{label}</div> : null}

      <div className="space-y-2">
        {options.map((opt) => {
          const id = `${name}-${opt.value}`;
          const checked = value === opt.value;

          return (
            <label key={String(opt.value)} htmlFor={id} className="flex items-center gap-2 text-sm">
              <input
                id={id}
                type="radio"
                name={name}
                value={opt.value}
                checked={checked}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="h-4 w-4"
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>

      {error ? <p className="text-xs">{error}</p> : null}
    </div>
  );
}
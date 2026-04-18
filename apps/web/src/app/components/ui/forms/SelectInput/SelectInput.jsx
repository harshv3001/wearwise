"use client";
import styles from "./SelectInput.module.scss";

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
        <label className={styles.fieldLabel} htmlFor={name}>
          {label} {required ? "*" : ""}
        </label>
      ) : null}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={[styles.input, selectClassName].join(" ")}
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

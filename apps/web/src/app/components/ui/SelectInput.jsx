"use client";

import styles from "./SelectInput/SelectInput.module.scss";

export default function SelectInput({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  placeholder = "Select an option",
  error,
  className = "",
  selectClassName = "",
}) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      {label ? (
        <label className={styles.fieldLabel} htmlFor={name}>
          {label} {required ? "*" : ""}
        </label>
      ) : null}

      <div className={styles.selectWrapper}>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={[styles.input, !value ? styles.placeholder : "", selectClassName]
            .filter(Boolean)
            .join(" ")}
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

        <span
          className={`material-symbols-outlined ${styles.icon}`}
          aria-hidden="true"
        >
          keyboard_arrow_down
        </span>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}

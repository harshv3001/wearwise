"use client";
import styles from "./Input.module.scss";

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
        <label className={styles.fieldLabel} htmlFor={name}>
          {label} {required ? "*" : ""}
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
        className={[styles.input, inputClassName].join(" ")}
        {...rest}
      />

      {error ? (
        <p className="text-xs text-red-500 m-2">{error}</p>
      ) : helperText ? (
        <p className="text-xs">{helperText}</p>
      ) : null}
    </div>
  );
}

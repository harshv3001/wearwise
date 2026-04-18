"use client";

import styles from "./Button.module.scss";
import ButtonSpinner from "../ButtonSpinner/ButtonSpinner";

export default function Button({
  children,
  type = "button",
  variant = "default",
  size = "md",
  loading = false,
  loadingText = "",
  loadingSpinnerSize = 18,
  disabled = false,
  onClick,
  fullWidth = false,
  className = "",
  ...rest
}) {
  const isDisabled = disabled || loading;

  const buttonClassName = [
    "inline-flex items-center justify-center whitespace-nowrap transition duration-200",
    fullWidth ? "w-full" : "w-fit",
    styles.button,
    variant !== "custom" ? styles[variant] : "",
    styles[size] || "",
    loading ? styles.loading : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={buttonClassName}
      aria-busy={loading}
      {...rest}
    >
      <span
        className={[styles.content, loading ? styles.contentHidden : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </span>

      {loading ? (
        <span className={styles.loadingContent}>
          <ButtonSpinner size={loadingSpinnerSize} />
          {loadingText ? <span>{loadingText}</span> : null}
        </span>
      ) : null}
    </button>
  );
}

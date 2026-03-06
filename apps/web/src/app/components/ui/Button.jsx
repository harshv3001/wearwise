"use client";

import styles from "../../../styles/ui/Button.module.scss";

export default function Button({
  children,
  type = "button",
  variant = "default",
  size = "md",
  disabled = false,
  onClick,
  fullWidth = false,
  className = "",
  ...rest
}) {
  const buttonClassName = [
    "inline-flex items-center justify-center whitespace-nowrap transition duration-200",
    fullWidth ? "w-full" : "w-fit",
    styles.button,
    variant !== "custom" ? styles[variant] : "",
    styles[size] || "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={buttonClassName}
      {...rest}
    >
      {children}
    </button>
  );
}

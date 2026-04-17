"use client";

import CircularProgress from "@mui/material/CircularProgress";
import styles from "./ButtonSpinner.module.scss";

export default function ButtonSpinner({
  size = 18,
  className = "",
  color = "inherit",
}) {
  const spinnerClassName = [styles.spinner, className].filter(Boolean).join(" ");

  return (
    <span className={spinnerClassName} aria-hidden="true">
      <CircularProgress size={size} thickness={5} color={color} />
    </span>
  );
}

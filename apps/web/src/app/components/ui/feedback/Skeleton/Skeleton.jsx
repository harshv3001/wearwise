"use client";

import MuiSkeleton from "@mui/material/Skeleton";
import styles from "./Skeleton.module.scss";

export default function Skeleton({
  variant = "rectangular",
  width,
  height,
  animation = "wave",
  className = "",
  sx,
  ...rest
}) {
  const skeletonClassName = [styles.skeleton, className]
    .filter(Boolean)
    .join(" ");

  return (
    <MuiSkeleton
      variant={variant}
      width={width}
      height={height}
      animation={animation}
      className={skeletonClassName}
      sx={sx}
      {...rest}
    />
  );
}

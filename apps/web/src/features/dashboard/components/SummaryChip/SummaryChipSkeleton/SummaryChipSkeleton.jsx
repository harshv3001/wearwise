"use client";

import { Skeleton } from "@/app/components/ui/feedback";
import styles from "./SummaryChipSkeleton.module.scss";

export default function SummaryChipSkeleton() {
  return (
    <Skeleton
      variant="rounded"
      width={124}
      height={34}
      className={styles.skeleton}
    />
  );
}

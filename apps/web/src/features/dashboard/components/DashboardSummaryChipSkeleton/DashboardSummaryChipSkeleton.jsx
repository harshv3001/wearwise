"use client";

import { Skeleton } from "@/app/components/ui/feedback";
import styles from "./DashboardSummaryChipSkeleton.module.scss";

export default function DashboardSummaryChipSkeleton() {
  return (
    <Skeleton
      variant="rounded"
      width={124}
      height={34}
      className={styles.skeleton}
    />
  );
}

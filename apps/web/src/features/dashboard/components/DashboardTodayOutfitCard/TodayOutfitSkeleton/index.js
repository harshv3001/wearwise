"use client";

import { Skeleton } from "@/app/components/ui/feedback";
import styles from "./TodayOutfitSkeleton.module.scss";

export default function TodayOutfitSkeleton() {
  return (
    <div className={styles.skeletonWrap}>
      <Skeleton className={styles.imageFrame} height={180} width="100%" />
      <Skeleton variant="text" width="74%" height={32} />
      <Skeleton variant="text" width="46%" height={22} />
      <Skeleton variant="rounded" width={118} height={32} />
      <Skeleton variant="text" width="68%" height={20} />
    </div>
  );
}

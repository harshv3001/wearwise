"use client";

import Skeleton from "../../../app/components/ui/Skeleton/Skeleton";
import styles from "./WeatherCard.module.scss";

export default function WeatherCardSkeleton() {
  return (
    <>
      <div className={styles.header}>
        <div className={styles.skeletonStack}>
          <Skeleton variant="text" width={80} height={18} />
          <Skeleton variant="text" width={180} height={30} />
          <Skeleton variant="text" width={130} height={24} />
        </div>

        <div className={styles.tempBlock}>
          <Skeleton variant="rounded" width={88} height={56} />
          <Skeleton variant="rounded" width={92} height={28} />
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.detail}>
          <Skeleton variant="text" width={72} height={18} />
          <Skeleton variant="text" width={88} height={24} />
        </div>
        <div className={styles.detail}>
          <Skeleton variant="text" width={80} height={18} />
          <Skeleton variant="text" width={94} height={24} />
        </div>
      </div>
    </>
  );
}

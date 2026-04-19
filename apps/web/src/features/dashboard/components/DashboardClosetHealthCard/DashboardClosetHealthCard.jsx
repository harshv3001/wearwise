"use client";

import { Card } from "@/app/components/ui/display";
import { Skeleton } from "@/app/components/ui/feedback";
import styles from "./DashboardClosetHealthCard.module.scss";

function HealthMetric({ label, value, toneClassName }) {
  return (
    <div className={`${styles.metricCard} ${toneClassName}`}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
    </div>
  );
}

export default function DashboardClosetHealthCard({
  closetHealth,
  isLoading = false,
  isError = false,
}) {
  const neverWornCount = closetHealth?.never_worn_count ?? 0;
  const lowRotationCount = closetHealth?.low_rotation_count ?? 0;
  const helperText =
    neverWornCount === 0 && lowRotationCount === 0
      ? "Nice balance. Your closet is getting regular use."
      : "A few items could use more rotation to keep your closet working for you.";

  return (
    <Card
      title="Closet Health"
      className={styles.card}
      contentClassName={styles.content}
      fullHeight
    >
      {isLoading ? (
        <>
          <div className={styles.metrics}>
            <Skeleton variant="rounded" width="100%" height={112} />
            <Skeleton variant="rounded" width="100%" height={112} />
          </div>
          <Skeleton variant="text" width="86%" height={22} />
          <Skeleton variant="text" width="64%" height={22} />
        </>
      ) : isError ? (
        <p className={styles.message}>
          Closet health details are unavailable right now.
        </p>
      ) : (
        <>
          <div className={styles.metrics}>
            <HealthMetric
              label="Never worn"
              value={neverWornCount}
              toneClassName={styles.neverWornTone}
            />
            <HealthMetric
              label="Low rotation"
              value={lowRotationCount}
              toneClassName={styles.lowRotationTone}
            />
          </div>

          <p className={styles.message}>{helperText}</p>
        </>
      )}
    </Card>
  );
}

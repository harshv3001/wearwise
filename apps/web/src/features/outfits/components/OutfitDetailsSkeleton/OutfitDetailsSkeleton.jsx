"use client";

import Skeleton from "@/app/components/ui/Skeleton/Skeleton";
import styles from "./OutfitDetailsSkeleton.module.scss";

function FieldSkeleton() {
  return (
    <div className={styles.field}>
      <Skeleton variant="text" width="38%" height={18} />
      <Skeleton height={50} />
    </div>
  );
}

function ItemRowSkeleton({ index }) {
  return (
    <div className={styles.itemRow} key={`item-row-${index}`}>
      <Skeleton className={styles.itemImage} height={56} width={56} />
      <div className={styles.itemText}>
        <Skeleton variant="text" width="70%" height={22} />
        <Skeleton variant="text" width="45%" height={18} />
      </div>
      <div className={styles.itemMeta}>
        <Skeleton variant="text" width={36} height={16} />
        <Skeleton variant="text" width={18} height={24} />
      </div>
    </div>
  );
}

export default function OutfitDetailsSkeleton() {
  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <Skeleton variant="text" width={120} height={18} />
          <Skeleton variant="text" width={280} height={42} />
        </div>

        <div className={styles.headerActions}>
          <Skeleton variant="rounded" width={132} height={40} />
          <Skeleton variant="rounded" width={132} height={40} />
        </div>
      </div>

      <div className={styles.detailsCard}>
        <div className={styles.fieldsGrid}>
          {Array.from({ length: 7 }).map((_, index) => (
            <FieldSkeleton key={`field-${index}`} />
          ))}
        </div>

        <div className={styles.bodyGrid}>
          <div className={styles.selectedCard}>
            <div className={styles.selectedHeader}>
              <div>
                <Skeleton variant="text" width={130} height={28} />
                <Skeleton variant="text" width={240} height={20} />
              </div>
              <Skeleton variant="text" width={60} height={20} />
            </div>

            <div className={styles.selectedList}>
              {Array.from({ length: 4 }).map((_, index) => (
                <ItemRowSkeleton index={index} key={`selected-${index}`} />
              ))}
            </div>
          </div>

          <div className={styles.previewFrame}>
            <Skeleton variant="text" width={170} height={18} />
            <Skeleton className={styles.previewImage} height={360} width="100%" />
          </div>
        </div>
      </div>
    </section>
  );
}

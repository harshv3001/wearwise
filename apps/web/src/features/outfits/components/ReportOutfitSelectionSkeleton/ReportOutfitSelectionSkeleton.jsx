"use client";

import { Skeleton } from "@/app/components/ui/feedback";
import styles from "./ReportOutfitSelectionSkeleton.module.scss";
import modalStyles from "../ReportOutfitModal/ReportOutfitModal.module.scss";

function OutfitRowSkeleton({ index }) {
  return (
    <div className={modalStyles.outfitRow} key={`report-skeleton-row-${index}`}>
      <div className={modalStyles.outfitPreviewCard}>
        <div className={modalStyles.outfitPreviewImageFrame}>
          <Skeleton className={styles.previewImage} height="100%" width="100%" />
        </div>
        <Skeleton variant="text" width="80%" height={24} />
      </div>

      <div className={modalStyles.outfitPreviewDetails}>
        <div className={styles.carouselGrid}>
          {Array.from({ length: 4 }).map((_, itemIndex) => (
            <div key={`report-skeleton-item-${itemIndex}`} className={styles.carouselCard}>
              <Skeleton className={styles.carouselImage} height={88} />
              <Skeleton variant="text" width="70%" height={18} />
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.meta}>
            <Skeleton variant="text" width={140} height={20} />
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={130} height={20} />
          </div>

          <div className={styles.actions}>
            <Skeleton variant="rounded" width={140} height={40} />
            <Skeleton variant="rounded" width={140} height={40} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportOutfitSelectionSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className={styles.topRow}>
        <Skeleton variant="text" width={180} height={26} />
        <Skeleton variant="rounded" width={240} height={44} />
      </div>

      <div className={modalStyles.outfitsContainer}>
        <div className={styles.headingWrap}>
          <Skeleton variant="text" width={160} height={28} />
        </div>

        {Array.from({ length: 2 }).map((_, index) => (
          <OutfitRowSkeleton key={`report-row-${index}`} index={index} />
        ))}
      </div>
    </div>
  );
}

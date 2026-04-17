"use client";

import Skeleton from "@/app/components/ui/Skeleton/Skeleton";
import styles from "./ClosetPageSkeleton.module.scss";

function SkeletonAccordionCard() {
  return (
    <div className={styles.accordionCard}>
      <div className={styles.accordionHeader}>
        <Skeleton variant="text" width="42%" height={30} />
        <Skeleton variant="circular" width={28} height={28} />
      </div>

      <div className={styles.accordionBody}>
        <div className={styles.carouselRow}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`closet-skeleton-${index}`} className={styles.carouselCard}>
              <Skeleton className={styles.carouselImage} height={148} />
              <Skeleton variant="text" width="75%" height={22} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ClosetPageSkeleton() {
  return (
    <div className={styles.layout}>
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonAccordionCard key={`closet-accordion-${index}`} />
      ))}
    </div>
  );
}

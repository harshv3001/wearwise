"use client";

import Skeleton from "@/app/components/ui/Skeleton/Skeleton";
import styles from "../page.module.scss";
import skeletonStyles from "./OutfitBuilderWorkspaceSkeleton.module.scss";

export default function OutfitBuilderWorkspaceSkeleton() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Skeleton variant="text" width={260} height={44} className={skeletonStyles.title} />
        </header>

        <div className={styles.builderLayout}>
          <div className={`${styles.sidebarPane} ${skeletonStyles.sidebar}`}>
            <Skeleton className={skeletonStyles.sidebarCard} height={620} />
          </div>

          <div className={styles.stagePane}>
            <Skeleton className={skeletonStyles.actionsBar} height={84} />
            <Skeleton className={skeletonStyles.canvas} height={640} />
          </div>
        </div>
      </div>
    </main>
  );
}

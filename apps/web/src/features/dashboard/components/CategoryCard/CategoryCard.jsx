"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/app/components/ui/actions";
import { Card } from "@/app/components/ui/display";
import { chunkDashboardItems } from "@/features/dashboard/dashboardHelper";
import CategorySkeletonColumn from "./CategorySkeletonColumn";
import CategoryMoreToggle from "./CategoryMoreToggle/CategoryMoreToggle";
import styles from "./CategoryCard.module.scss";

export default function CategoryCard({
  categoryCounts = [],
  isLoading = false,
  isError = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const normalizedItems = useMemo(
    () =>
      categoryCounts.map((item, index) => ({
        id: `${item.category}-${index}`,
        name: item.category,
        qty: item.count,
      })),
    [categoryCounts]
  );

  const [hasMoreThanInitialRows, visibleLeftColumn, visibleRightColumn] =
    useMemo(
      () => chunkDashboardItems(normalizedItems, expanded),
      [normalizedItems, expanded]
    );

  return (
    <Card
      title="Category Count"
      contentClassName={styles.content}
      fullHeight
      compact
    >
      {isLoading ? (
        <>
          <div className={styles.columns}>
            <CategorySkeletonColumn />
            <CategorySkeletonColumn />
          </div>

          <div className={styles.footer}>
            <div className={styles.buttonSkeleton} />
          </div>
        </>
      ) : isError ? (
        <p className={styles.message}>
          Category counts are unavailable right now.
        </p>
      ) : normalizedItems.length === 0 ? (
        <p className={styles.message}>
          Add a few clothing items and your closet breakdown will show up here.
        </p>
      ) : (
        <>
          <div className={styles.columns}>
            {[visibleLeftColumn, visibleRightColumn].map(
              (column, columnIndex) => (
                <div
                  key={`category-column-${columnIndex}`}
                  className={styles.column}
                >
                  <div className={styles.headerRow}>
                    <span>Category</span>
                    <span>Qty</span>
                  </div>

                  {column.map((item) => (
                    <div key={item.id} className={styles.itemRow}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemQty}>{item.qty}</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>

          {hasMoreThanInitialRows ? (
            <div className={styles.moreWrap}>
              <CategoryMoreToggle
                expanded={expanded}
                onToggle={() => setExpanded((current) => !current)}
              />
            </div>
          ) : null}

          <div className={styles.footer}>
            <Link href="/closet">
              <Button variant="tertiary" size="sm">
                Go to Closet
              </Button>
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}

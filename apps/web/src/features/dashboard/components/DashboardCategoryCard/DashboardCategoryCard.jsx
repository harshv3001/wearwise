"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/actions";
import { Card } from "@/app/components/ui/display";
import { chunkDashboardItems } from "@/features/dashboard/dashboardHelper";
import CategorySkeletonColumn from "./CategorySkeletonColumn";
import styles from "./DashboardCategoryCard.module.scss";

export default function DashboardCategoryCard({
  categoryCounts = [],
  isLoading = false,
  isError = false,
}) {
  const normalizedItems = categoryCounts.map((item, index) => ({
    id: `${item.category}-${index}`,
    name: item.category,
    qty: item.count,
  }));
  const [leftColumn, rightColumn] = chunkDashboardItems(normalizedItems);

  return (
    <Card
      title="Category Count"
      className={styles.card}
      contentClassName={styles.content}
      fullHeight
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
            {[leftColumn, rightColumn].map((column, columnIndex) => (
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
            ))}
          </div>

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

"use client";

import { Button } from "../../../app/components/ui/actions";
import { Card } from "../../../app/components/ui/display";
import styles from "./CategorySummaryCard.module.scss";
import Link from "next/link";

export default function CategorySummaryCard({ items = [] }) {
  const midpoint = Math.ceil(items.length / 2);
  const leftColumn = items.slice(0, midpoint);
  const rightColumn = items.slice(midpoint);

  const columns = [leftColumn, rightColumn];

  return (
    <Card className={styles.CategorySummaryCard}>
      <div className="grid grid-cols-2">
        {columns.map((column, index) => (
          <div key={index} className="flex flex-col w-32">
            <div className={`grid grid-cols-[1fr_auto] ${styles.header}`}>
              <span>Category</span>
              <span>Qty</span>
            </div>

            <div className="flex flex-col">
              {column.map((item) => (
                <div
                  key={item.id}
                  className={`grid grid-cols-[1fr_auto] ${styles.row}`}
                >
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.qty}>{item.qty}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={`flex justify-center ${styles.buttonWrap}`}>
        <Link href="/closet">
          <Button variant="tertiary">Go to Closet</Button>
        </Link>
      </div>
    </Card>
  );
}

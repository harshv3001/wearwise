"use client";

import Link from "next/link";
import { ImageWithFallback } from "@/app/components/ui/display";
import { formatCapitalizedValue } from "@/lib/helperFunctions";
import styles from "./UsageItem.module.scss";

export default function UsageItem({ item, accentClassName }) {
  return (
    <Link href={`/closet/${item.id}`} className={styles.link}>
      <article className={styles.usageCard}>
        <ImageWithFallback
          imageUrl={item.image_url}
          alt={item.name}
          fallbackText={item.name}
          className={styles.imageFrame}
          imgClassName={styles.image}
        />

        <div className={styles.itemName}>{item.name}</div>
        <div className={styles.itemCategory}>
          {formatCapitalizedValue(item.category)}
        </div>
        <div className={`${styles.wornCount} ${accentClassName}`}>
          Worn {item.times_worn}x
        </div>
      </article>
    </Link>
  );
}

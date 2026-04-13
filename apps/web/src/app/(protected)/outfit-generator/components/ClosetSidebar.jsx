"use client";

import ClosetAccordion from "@/app/components/closet/ClosetAccordion.jsx";
import styles from "./ClosetSidebar.module.scss";

export default function ClosetSidebar({
  categoryNames,
  categoriesByName,
  onAddItem,
  onDragItemStart,
}) {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.title}>My closet</h2>

      <div className={styles.content}>
        <ClosetAccordion
          categoryNames={categoryNames}
          categoriesByName={categoriesByName}
          onItemClick={(_, item) => onAddItem(item)}
          getCarouselProps={() => ({
            enableCarouselDrag: false,
            onItemDragStart: (event, item) => onDragItemStart(event, item),
          })}
        />
      </div>
    </aside>
  );
}

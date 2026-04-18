"use client";

import ClosetAccordion from "@/app/components/closet/ClosetAccordion.jsx";
import { Drawer } from "@/app/components/ui/overlays";
import styles from "./ClosetSidebar.module.scss";

export default function ClosetSidebar({
  categoryNames,
  categoriesByName,
  onAddItem,
  onDragItemStart,
  open = false,
  onClose,
}) {
  return (
    <>
      <aside className={styles.sidebar} aria-label="Closet sidebar">
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

      <Drawer
        open={open}
        onClose={onClose}
        title="My closet"
        className={styles.mobileDrawer}
        bodyClassName={styles.mobileDrawerBody}
        headerClassName={styles.mobileHeader}
        titleClassName={styles.mobileTitle}
        closeButtonClassName={styles.closeButton}
        closeIconClassName={styles.closeIcon}
      >
        <ClosetAccordion
          categoryNames={categoryNames}
          categoriesByName={categoriesByName}
          onItemClick={(_, item) => {
            onAddItem(item);
            onClose?.();
          }}
          getCarouselProps={() => ({
            enableCarouselDrag: false,
            onItemDragStart: (event, item) => onDragItemStart(event, item),
          })}
        />
      </Drawer>
    </>
  );
}

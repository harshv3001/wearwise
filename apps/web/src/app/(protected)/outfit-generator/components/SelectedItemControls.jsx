"use client";

import { Button } from "@/app/components/ui/actions";
import styles from "./SelectedItemControls.module.scss";

export default function SelectedItemControls({
  selectedItem,
  onMoveForward,
  onMoveBackward,
  onRemove,
}) {
  if (!selectedItem) {
    return (
      <div className={styles.empty}>
        Click an item on the canvas to resize it, rotate it, or adjust its layer
        order.
      </div>
    );
  }

  return (
    <div className={styles.controls}>
      <div className={styles.meta}>
        <div className={styles.label}>Selected</div>
        <div className={styles.name}>{selectedItem.name}</div>
      </div>

      <Button
        type="button"
        variant="default"
        size="sm"
        onClick={onMoveBackward}
      >
        Send Back
      </Button>
      <Button type="button" variant="default" size="sm" onClick={onMoveForward}>
        Bring Forward
      </Button>
      <Button type="button" variant="tertiary" size="sm" onClick={onRemove}>
        Remove
      </Button>
    </div>
  );
}

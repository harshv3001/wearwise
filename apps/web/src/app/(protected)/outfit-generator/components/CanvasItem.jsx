"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ImageWithFallback } from "@/app/components/ui/display";
import { clamp } from "../utils/outfitCanvasUtils.js";
import styles from "./CanvasItem.module.scss";

function getAngleFromCenter(pointX, pointY, centerX, centerY) {
  return (Math.atan2(pointY - centerY, pointX - centerX) * 180) / Math.PI;
}

export default function CanvasItem({
  item,
  isSelected,
  stageSize,
  onSelect,
  onUpdate,
}) {
  const elementRef = useRef(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const itemStyle = useMemo(
    () => ({
      left: item.x,
      top: item.y,
      width: item.width,
      height: item.height,
      zIndex: item.zIndex,
      transform: `rotate(${item.rotation}deg)`,
    }),
    [item.height, item.rotation, item.width, item.x, item.y, item.zIndex]
  );

  const beginPointerInteraction = useCallback(
    (event, mode) => {
      event.preventDefault();
      event.stopPropagation();
      onSelect(item.instanceId);

      const initialPointer = {
        x: event.clientX,
        y: event.clientY,
      };

      const initialItem = {
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        rotation: item.rotation,
      };

      const rect = elementRef.current?.getBoundingClientRect();
      const centerX = rect ? rect.left + rect.width / 2 : item.x + item.width / 2;
      const centerY = rect ? rect.top + rect.height / 2 : item.y + item.height / 2;
      const initialAngle = getAngleFromCenter(
        event.clientX,
        event.clientY,
        centerX,
        centerY
      );

      setIsInteracting(true);

      const handlePointerMove = (moveEvent) => {
        if (mode === "move") {
          const deltaX = moveEvent.clientX - initialPointer.x;
          const deltaY = moveEvent.clientY - initialPointer.y;

          onUpdate(item.instanceId, {
            x: initialItem.x + deltaX,
            y: initialItem.y + deltaY,
          }, stageSize);
          return;
        }

        if (mode === "resize") {
          const deltaX = moveEvent.clientX - initialPointer.x;
          const width = clamp(initialItem.width + deltaX, 72, stageSize.width || 420);
          const aspectRatio = initialItem.height / initialItem.width || 1;
          const height = clamp(width * aspectRatio, 72, stageSize.height || 420);

          onUpdate(
            item.instanceId,
            {
              width,
              height,
            },
            stageSize
          );
          return;
        }

        const nextAngle = getAngleFromCenter(
          moveEvent.clientX,
          moveEvent.clientY,
          centerX,
          centerY
        );

        onUpdate(
          item.instanceId,
          {
            rotation: initialItem.rotation + (nextAngle - initialAngle),
          },
          stageSize
        );
      };

      const endPointerInteraction = () => {
        setIsInteracting(false);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", endPointerInteraction);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", endPointerInteraction);
    },
    [
      item.height,
      item.instanceId,
      item.rotation,
      item.width,
      item.x,
      item.y,
      onSelect,
      onUpdate,
      stageSize,
    ]
  );

  return (
    <div
      ref={elementRef}
      role="button"
      tabIndex={0}
      className={[
        styles.item,
        isSelected ? styles.selected : "",
        isInteracting ? styles.interacting : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={itemStyle}
      onPointerDown={(event) => beginPointerInteraction(event, "move")}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(item.instanceId);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item.instanceId);
        }
      }}
    >
      <ImageWithFallback
        imageUrl={item.imageUrl}
        alt={item.name}
        fallbackText={item.name}
        className={styles.imageWrapper}
        imgClassName={styles.image}
      />

      {isSelected ? (
        <>
          <span className={styles.selectionBorder} />
          <button
            type="button"
            className={`${styles.handle} ${styles.rotateHandle}`}
            onPointerDown={(event) => beginPointerInteraction(event, "rotate")}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Rotate ${item.name}`}
          >
            <span
              className={`material-symbols-outlined ${styles.handleIcon}`}
              aria-hidden="true"
            >
              refresh
            </span>
          </button>

          <button
            type="button"
            className={`${styles.handle} ${styles.resizeHandle}`}
            onPointerDown={(event) => beginPointerInteraction(event, "resize")}
            onClick={(event) => event.stopPropagation()}
            aria-label={`Resize ${item.name}`}
          >
            <span
              className={`material-symbols-outlined ${styles.handleIcon}`}
              aria-hidden="true"
            >
              open_in_full
            </span>
          </button>
        </>
      ) : null}
    </div>
  );
}

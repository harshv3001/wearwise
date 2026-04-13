"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  clampItemPosition,
  createCanvasItemFromClosetItem,
  normalizeCanvasItemOrder,
} from "../utils/outfitCanvasUtils.js";

export function useOutfitCanvasState() {
  const insertionCountRef = useRef(0);
  const [canvasItems, setCanvasItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);

  const addClosetItemToCanvas = useCallback(
    (closetItem, stageSize, droppedPosition) => {
    if (!closetItem?.id) return;

    const nextItem = createCanvasItemFromClosetItem(
      closetItem,
      insertionCountRef.current,
      stageSize,
      droppedPosition
    );

    insertionCountRef.current += 1;
    setSelectedItemId(nextItem.instanceId);

    setCanvasItems((previousItems) => [...previousItems, nextItem]);
    },
    []
  );

  const updateCanvasItem = useCallback((instanceId, updater, stageSize) => {
    setCanvasItems((previousItems) =>
      previousItems.map((item) => {
        if (item.instanceId !== instanceId) return item;

        const nextItem =
          typeof updater === "function" ? updater(item) : { ...item, ...updater };

        return clampItemPosition(nextItem, stageSize);
      })
    );
  }, []);

  const removeCanvasItem = useCallback((instanceId) => {
    setCanvasItems((previousItems) =>
      normalizeCanvasItemOrder(
        previousItems.filter((item) => item.instanceId !== instanceId)
      )
    );

    setSelectedItemId((previousSelectedId) =>
      previousSelectedId === instanceId ? null : previousSelectedId
    );
  }, []);

  const clearCanvasItems = useCallback(() => {
    setCanvasItems([]);
    setSelectedItemId(null);
    insertionCountRef.current = 0;
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  const reorderSelectedItem = useCallback((direction) => {
    setCanvasItems((previousItems) => {
      if (!selectedItemId || previousItems.length < 2) {
        return previousItems;
      }

      const orderedItems = normalizeCanvasItemOrder(previousItems);
      const selectedIndex = orderedItems.findIndex(
        (item) => item.instanceId === selectedItemId
      );

      if (selectedIndex === -1) return previousItems;

      let targetIndex = selectedIndex;

      if (direction === "front") {
        targetIndex = orderedItems.length - 1;
      } else if (direction === "forward") {
        targetIndex = Math.min(selectedIndex + 1, orderedItems.length - 1);
      } else if (direction === "backward") {
        targetIndex = Math.max(selectedIndex - 1, 0);
      } else if (direction === "back") {
        targetIndex = 0;
      }

      if (targetIndex === selectedIndex) {
        return previousItems;
      }

      const nextItems = [...orderedItems];
      const [selectedItem] = nextItems.splice(selectedIndex, 1);
      nextItems.splice(targetIndex, 0, selectedItem);

      return normalizeCanvasItemOrder(nextItems);
    });
  }, [selectedItemId]);

  const removeSelectedItem = useCallback(() => {
    if (!selectedItemId) return;
    removeCanvasItem(selectedItemId);
  }, [removeCanvasItem, selectedItemId]);

  const selectedItem = useMemo(
    () => canvasItems.find((item) => item.instanceId === selectedItemId) || null,
    [canvasItems, selectedItemId]
  );

  const selectedItemCount = selectedItem ? 1 : 0;

  return {
    canvasItems,
    selectedItem,
    selectedItemId,
    selectedItemCount,
    setSelectedItemId,
    addClosetItemToCanvas,
    updateCanvasItem,
    removeCanvasItem,
    removeSelectedItem,
    reorderSelectedItem,
    clearCanvasItems,
    clearSelection,
  };
}

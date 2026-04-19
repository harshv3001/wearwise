"use client";

import Carousel from "../../../features/carousel/component/Carousel/Carousel.jsx";
import { SaveToggle } from "../../components/ui/actions";
import { formatCapitalizedValue } from "../../../lib/helperFunctions.js";
import { memo, useCallback, useState } from "react";

function OutfitCategoryRow({
  categoryName,
  closetItems,
  isSelected,
  isFocused,
  canRemove,
  onFocusedItemChange,
  onToggleSelectedItem,
  onRemoveCategory,
  reorderCategories,
}) {
  const [isDraggingRow, setIsDraggingRow] = useState(false);
  const [isDragOverRow, setIsDragOverRow] = useState(false);

  const handleDragStart = useCallback(
    (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", categoryName);
      setIsDraggingRow(true);
    },
    [categoryName]
  );

  const handleDragEnter = useCallback(
    (event) => {
      const sourceCategory = event.dataTransfer.getData("text/plain");
      if (!sourceCategory || sourceCategory === categoryName) return;
      setIsDragOverRow((prev) => (prev ? prev : true));
    },
    [categoryName]
  );

  const handleDragLeave = useCallback((event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragOverRow((prev) => (prev ? false : prev));
    }
  }, []);

  const handleDrop = useCallback(
    (event) => {
      const sourceCategory = event.dataTransfer.getData("text/plain");
      reorderCategories(sourceCategory, categoryName);
      setIsDragOverRow(false);
    },
    [categoryName, reorderCategories]
  );

  const handleDragEnd = useCallback(() => {
    setIsDraggingRow(false);
    setIsDragOverRow(false);
  }, []);

  const rowClassName = `grid grid-cols-[120px_minmax(0,1fr)_120px] items-center gap-6 rounded-[24px] border px-5 py-3 transition max-md:grid-cols-1 max-md:gap-4 max-md:px-4 max-md:py-4 ${
    isDragOverRow && !isDraggingRow
      ? "border-[#d48d7b] bg-[#fff7f4] shadow-[0_0_0_4px_rgba(244,190,173,0.35)]"
      : "border-transparent"
  } ${isDraggingRow ? "cursor-grabbing opacity-70" : "cursor-grab"}`;

  const handleRemove = useCallback(() => {
    onRemoveCategory(categoryName);
  }, [categoryName, onRemoveCategory]);

  const handleToggleSave = useCallback(() => {
    onToggleSelectedItem(categoryName);
  }, [categoryName, onToggleSelectedItem]);

  const handleFocusedChange = useCallback(
    (selectedItem) => {
      onFocusedItemChange(categoryName, selectedItem);
    },
    [categoryName, onFocusedItemChange]
  );

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={rowClassName}
    >
      <div className="flex items-center justify-between gap-3 max-md:order-1">
        <div className="min-w-0">
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="mb-2 flex w-fit items-center gap-2 text-[#b57d70]"
          >
            <span
              className="material-symbols-outlined text-[18px]"
              aria-hidden="true"
            >
              drag_indicator
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
              Drag
            </span>
          </div>
          <p className="text-xs font-semibold tracking-[0.24em] text-[#b57d70]">
            CATEGORY
          </p>
          <p className="truncate text-base font-bold text-[#463533]">
            {formatCapitalizedValue(categoryName)}
          </p>
        </div>
        {canRemove ? (
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9c9c4] bg-white text-[#8d6d66] transition hover:border-[#c3a29a] hover:bg-[#fff4f1]"
            aria-label={`Remove ${categoryName} row`}
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              remove
            </span>
          </button>
        ) : null}
      </div>

      <Carousel
        categoryName={categoryName}
        closetItems={closetItems}
        parentSetSelectedCallback={handleFocusedChange}
        removalCallback={handleRemove}
        disableRemoval={!canRemove}
        hideHeader
        hideTitle
      />

      <div className="flex items-center justify-end max-md:order-3 max-md:justify-start">
        <SaveToggle
          selected={isSelected}
          disabled={!isFocused}
          onClick={handleToggleSave}
        />
      </div>
    </div>
  );
}

export default memo(OutfitCategoryRow);

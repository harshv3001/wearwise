"use client";

import Carousel from "../../../features/carousel/component/Carousel.jsx";
import SaveToggle from "../../components/ui/SaveToggle/SaveToggle.jsx";
import { formatCapitalizedValue } from "../../../lib/helperFunctions.js";

export default function OutfitCategoryRow({
  categoryName,
  index,
  closetItems,
  isSelected,
  isFocused,
  isDragged,
  isDragOver,
  canRemove,
  onFocusedItemChange,
  onToggleSelectedItem,
  onRemoveCategory,
  onDragStart,
  onDragEnter,
  onDrop,
  onDragEnd,
}) {
  const rowClassName = `grid grid-cols-[120px_minmax(0,1fr)_120px] items-center gap-6 rounded-[24px] border px-5 py-3 transition ${
    isDragOver && !isDragged
      ? "border-[#d48d7b] bg-[#fff7f4] shadow-[0_0_0_4px_rgba(244,190,173,0.35)]"
      : "border-transparent"
  } ${isDragged ? "cursor-grabbing opacity-70" : "cursor-grab"}`;

  const handleDragStart = (event) => {
    onDragStart(event, categoryName);
  };

  const handleDragEnter = () => {
    onDragEnter(categoryName);
  };

  const handleDrop = () => {
    onDrop(categoryName);
  };

  const handleRemove = () => {
    onRemoveCategory(categoryName);
  };

  const handleToggleSave = () => {
    onToggleSelectedItem(categoryName);
  };

  const handleFocusedChange = (selectedItem) => {
    onFocusedItemChange(categoryName, selectedItem);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnter={handleDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
      className={rowClassName}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[#b57d70]">
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

      <div className="flex items-center justify-end">
        <SaveToggle
          selected={isSelected}
          disabled={!isFocused}
          onClick={handleToggleSave}
        />
      </div>
    </div>
  );
}

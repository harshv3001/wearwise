"use client";

import { useMemo, useState } from "react";
import { useClosetItemsQuery } from "../../../features/closet/hooks/useClosetItemsQuery.js";
import Button from "../../components/ui/Button.jsx";
import OutfitCategoryRow from "./OutfitCategoryRow.jsx";

const INITIAL_CATEGORY_COUNT = 3;

export default function OutfitGeneratorPage() {
  const { data: allClosetItems, isLoading } = useClosetItemsQuery();

  const [activeCategories, setActiveCategories] = useState([]);
  const [focusedItemsByCategory, setFocusedItemsByCategory] = useState({});
  const [selectedItemsByCategory, setSelectedItemsByCategory] = useState({});
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);

  const groupedCategories = useMemo(() => {
    const closetData = {};

    (allClosetItems || []).forEach((closetItem) => {
      if (!closetData[closetItem.category]) {
        closetData[closetItem.category] = [closetItem];
      } else {
        closetData[closetItem.category].push(closetItem);
      }
    });

    return closetData;
  }, [allClosetItems]);

  const allCategoryNames = useMemo(
    () => Object.keys(groupedCategories),
    [groupedCategories]
  );

  const visibleCategories =
    activeCategories.length > 0
      ? activeCategories
      : allCategoryNames.slice(0, INITIAL_CATEGORY_COUNT);

  const remainingCategories = allCategoryNames.filter(
    (category) => !visibleCategories.includes(category)
  );

  const handleAddCategory = () => {
    if (remainingCategories.length === 0) return;

    setActiveCategories((prev) => [
      ...(prev.length > 0
        ? prev
        : allCategoryNames.slice(0, INITIAL_CATEGORY_COUNT)),
      remainingCategories[0],
    ]);
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setActiveCategories((prev) =>
      (prev.length > 0
        ? prev
        : allCategoryNames.slice(0, INITIAL_CATEGORY_COUNT)
      ).filter((category) => category !== categoryToRemove)
    );
    setFocusedItemsByCategory((prev) => {
      const next = { ...prev };
      delete next[categoryToRemove];
      return next;
    });
    setSelectedItemsByCategory((prev) => {
      const next = { ...prev };
      delete next[categoryToRemove];
      return next;
    });
  };

  const handleFocusedItemChange = (categoryName, selectedItem) => {
    if (!selectedItem?.id) return;

    setFocusedItemsByCategory((prev) => ({
      ...prev,
      [categoryName]: selectedItem,
    }));

    setSelectedItemsByCategory((prev) => {
      if (!prev[categoryName]) {
        return prev;
      }

      return {
        ...prev,
        [categoryName]: selectedItem,
      };
    });
  };

  const handleToggleSelectedItem = (categoryName) => {
    const focusedItem = focusedItemsByCategory[categoryName];
    if (!focusedItem?.id) return;

    setSelectedItemsByCategory((prev) => {
      if (prev[categoryName]) {
        const next = { ...prev };
        delete next[categoryName];
        return next;
      }

      return {
        ...prev,
        [categoryName]: focusedItem,
      };
    });
  };

  const selectedItemCount = useMemo(() => {
    return Object.keys(selectedItemsByCategory).length;
  }, [selectedItemsByCategory]);

  const reorderCategories = (sourceCategory, targetCategory) => {
    if (!sourceCategory || !targetCategory || sourceCategory === targetCategory) {
      return;
    }

    const currentCategories =
      activeCategories.length > 0
        ? activeCategories
        : allCategoryNames.slice(0, INITIAL_CATEGORY_COUNT);

    const sourceIndex = currentCategories.indexOf(sourceCategory);
    const targetIndex = currentCategories.indexOf(targetCategory);

    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }

    const nextCategories = [...currentCategories];
    const [movedCategory] = nextCategories.splice(sourceIndex, 1);
    nextCategories.splice(targetIndex, 0, movedCategory);

    setActiveCategories(nextCategories);
  };

  const handleDragStart = (event, categoryName) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", categoryName);
    setDraggedCategory(categoryName);
    setDragOverCategory(categoryName);
  };

  const handleDragEnter = (categoryName) => {
    if (!draggedCategory || draggedCategory === categoryName) return;
    setDragOverCategory(categoryName);
  };

  const handleDrop = (categoryName) => {
    reorderCategories(draggedCategory, categoryName);
    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  const handleDragEnd = () => {
    setDraggedCategory(null);
    setDragOverCategory(null);
  };

  if (isLoading) {
    return <main className="p-6">Loading...</main>;
  }

  return (
    <main className="p-6">
      <div className="mx-auto max-w-[980px]">
        <div className="mb-8">
          <h1 className="text-[32px] text-center">Make an Outfit</h1>
          <div className="mt-4 flex items-center justify-end gap-4">
            <span className="text-sm font-medium text-[#6f5b56]">
              {selectedItemCount} item{selectedItemCount === 1 ? "" : "s"} ready
            </span>
            <Button
              type="button"
              onClick={() => alert("Outfit saved!")}
              variant="primary"
              size="lg"
            >
              Save the Outfit
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {visibleCategories.map((categoryName, index) => (
            <OutfitCategoryRow
              key={categoryName}
              index={index}
              categoryName={categoryName}
              closetItems={groupedCategories[categoryName] || []}
              isSelected={Boolean(selectedItemsByCategory[categoryName])}
              isFocused={Boolean(focusedItemsByCategory[categoryName])}
              isDragged={draggedCategory === categoryName}
              isDragOver={dragOverCategory === categoryName}
              canRemove={index >= INITIAL_CATEGORY_COUNT}
              onFocusedItemChange={handleFocusedItemChange}
              onToggleSelectedItem={handleToggleSelectedItem}
              onRemoveCategory={handleRemoveCategory}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}
          <div className="flex items-center justify-start pt-2">
            {remainingCategories.length > 0 && (
              <button
                type="button"
                onClick={handleAddCategory}
                className="w-10 h-10 rounded-full border border-gray-300 text-xl flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

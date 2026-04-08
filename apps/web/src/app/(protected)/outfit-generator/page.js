"use client";

import { useMemo, useState } from "react";
import Carousel from "../../../features/carousel/component/Carousel.jsx";
import { useClosetItemsQuery } from "../../../features/closet/hooks/useClosetItemsQuery.js";
import Button from "../../components/ui/Button.jsx";
import { formatCapitalizedValue } from "../../../lib/helperFunctions.js";

const INITIAL_CATEGORY_COUNT = 3;

export default function OutfitGeneratorPage() {
  const { data: allClosetItems, isLoading } = useClosetItemsQuery();

  const [activeCategories, setActiveCategories] = useState([]);
  const [focusedItemsByCategory, setFocusedItemsByCategory] = useState({});
  const [selectedItemsByCategory, setSelectedItemsByCategory] = useState({});

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
            <div
              key={categoryName}
              className="grid grid-cols-[120px_minmax(0,1fr)_120px] items-center gap-6 px-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold tracking-[0.24em] text-[#b57d70]">
                    CATEGORY
                  </p>
                  <p className="truncate text-base font-bold text-[#463533]">
                    {formatCapitalizedValue(categoryName)}
                  </p>
                </div>
                {index >= INITIAL_CATEGORY_COUNT ? (
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(categoryName)}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9c9c4] bg-white text-[#8d6d66] transition hover:border-[#c3a29a] hover:bg-[#fff4f1]"
                    aria-label={`Remove ${categoryName} row`}
                  >
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      remove
                    </span>
                  </button>
                ) : null}
              </div>

              <Carousel
                categoryName={categoryName}
                closetItems={groupedCategories[categoryName] || []}
                parentSetSelectedCallback={(selectedItem) =>
                  handleFocusedItemChange(categoryName, selectedItem)
                }
                removalCallback={() => handleRemoveCategory(categoryName)}
                disableRemoval={index < INITIAL_CATEGORY_COUNT}
                hideHeader
                hideTitle
              />
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleToggleSelectedItem(categoryName)}
                  disabled={!focusedItemsByCategory[categoryName]}
                  aria-pressed={Boolean(selectedItemsByCategory[categoryName])}
                  className={`flex min-w-[120px] items-center justify-between gap-3 rounded-full border px-4 py-3 text-left transition ${
                    selectedItemsByCategory[categoryName]
                      ? "border-[#1f7a67] bg-[#dff7ee] text-[#134c40]"
                      : "border-[#d9c9c4] bg-white text-[#6f5b56] hover:border-[#c3a29a] hover:bg-[#fff4f1]"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                    Save
                  </span>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm ${
                      selectedItemsByCategory[categoryName]
                        ? "border-[#1f7a67] bg-[#1f7a67] text-white"
                        : "border-[#cdb9b2] bg-[#fff8f6] text-transparent"
                    }`}
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                </button>
              </div>
            </div>
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

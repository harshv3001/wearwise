"use client";

import { useCallback, useMemo, useState } from "react";
import { useClosetItemsQuery } from "../../../features/closet/hooks/useClosetItemsQuery.js";
import Button from "../../components/ui/Button.jsx";
import OutfitCategoryRow from "./OutfitCategoryRow.jsx";
import SaveOutfitModal from "./components/SaveOutfitModal.jsx";
import styles from "./page.module.scss";

const INITIAL_CATEGORY_COUNT = 3;

export default function OutfitGeneratorPage() {
  const { data: allClosetItems, isLoading } = useClosetItemsQuery();

  const [activeCategories, setActiveCategories] = useState([]);
  const [focusedItemsByCategory, setFocusedItemsByCategory] = useState({});
  const [selectedItemsByCategory, setSelectedItemsByCategory] = useState({});

  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

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

  const handleAddCategory = useCallback(() => {
    if (remainingCategories.length === 0) return;

    setActiveCategories((prev) => [
      ...(prev.length > 0
        ? prev
        : allCategoryNames.slice(0, INITIAL_CATEGORY_COUNT)),
      remainingCategories[0],
    ]);
  }, [allCategoryNames, remainingCategories]);

  const handleRemoveCategory = useCallback((categoryToRemove) => {
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
  }, [allCategoryNames]);

  const handleFocusedItemChange = useCallback((categoryName, selectedItem) => {
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
  }, []);

  const handleToggleSelectedItem = useCallback((categoryName) => {
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
  }, [focusedItemsByCategory]);

  const selectedItemCount = useMemo(() => {
    return Object.keys(selectedItemsByCategory).length;
  }, [selectedItemsByCategory]);

  const orderedSelectedItems = useMemo(() => {
    return visibleCategories
      .filter((categoryName) => Boolean(selectedItemsByCategory[categoryName]))
      .map((categoryName, index) => ({
        ...selectedItemsByCategory[categoryName],
        category: categoryName,
        position: index + 1,
        layer: 1,
      }));
  }, [selectedItemsByCategory, visibleCategories]);

  const reorderCategories = useCallback((sourceCategory, targetCategory) => {
    if (
      !sourceCategory ||
      !targetCategory ||
      sourceCategory === targetCategory
    ) {
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
  }, [activeCategories, allCategoryNames]);

  const handleOpenSaveModal = useCallback(() => {
    if (orderedSelectedItems.length === 0) {
      alert("Select at least one item before saving the outfit.");
      return;
    }

    setIsSaveModalOpen(true);
  }, [orderedSelectedItems.length]);

  const handleCloseSaveModal = useCallback(() => {
    setIsSaveModalOpen(false);
  }, []);

  if (isLoading) {
    return <main className="p-6">Loading...</main>;
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Make an Outfit</h1>
          <div className={styles.actions}>
            <span className={styles.readyText}>
              {selectedItemCount} item{selectedItemCount === 1 ? "" : "s"} ready
            </span>
            <Button
              type="button"
              onClick={handleOpenSaveModal}
              variant="primary"
              size="lg"
              disabled={selectedItemCount === 0}
            >
              Save the Outfit
            </Button>
          </div>
        </div>

        <div className={styles.rows}>
          {visibleCategories.map((categoryName, index) => (
            <OutfitCategoryRow
              key={categoryName}
              index={index}
              categoryName={categoryName}
              closetItems={groupedCategories[categoryName] || []}
              isSelected={Boolean(selectedItemsByCategory[categoryName])}
              isFocused={Boolean(focusedItemsByCategory[categoryName])}
              canRemove={index >= INITIAL_CATEGORY_COUNT}
              onFocusedItemChange={handleFocusedItemChange}
              onToggleSelectedItem={handleToggleSelectedItem}
              onRemoveCategory={handleRemoveCategory}
              reorderCategories={reorderCategories}
            />
          ))}
          <div className={styles.addButtonRow}>
            {remainingCategories.length > 0 && (
              <button
                type="button"
                onClick={handleAddCategory}
                className={styles.addButton}
              >
                +
              </button>
            )}
          </div>
        </div>
      </div>

      <SaveOutfitModal
        open={isSaveModalOpen}
        onClose={handleCloseSaveModal}
        selectedItems={orderedSelectedItems}
      />
    </main>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";

import Carousel from "../../../features/carousel/component/Carousel.jsx";
import { useClosetItemsQuery } from "../../../features/closet/hooks/useClosetItemsQuery.js";
import Button from "../../components/ui/Button.jsx";
import CreateOutfit from "../../../features/outfits/components/CreateOutfit.jsx";

const INITIAL_CATEGORY_COUNT = 3;
const MAX_CATEGORY_COUNT = 4;

export default function OutfitGeneratorPage() {
  const { data: allClosetItems, isLoading } = useClosetItemsQuery();

  const [groupedCategories, setGroupedCategories] = useState({});
  const [activeCategories, setActiveCategories] = useState([]);
  const [selectedItemsByCategory, setSelectedItemsByCategory] = useState({});
  const [openOutfitModal, setOpenOutfitModal] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const previewRef = useRef(null);

  useEffect(() => {
    if (!allClosetItems) return;

    const closetData = {};

    allClosetItems.forEach((ci) => {
      if (!closetData[ci.category]) {
        closetData[ci.category] = [ci];
      } else {
        closetData[ci.category].push(ci);
      }
    });

    setGroupedCategories(closetData);

    const allCategoryNames = Object.keys(closetData);

    setActiveCategories((prev) => {
      if (prev.length > 0) return prev;
      return allCategoryNames.slice(0, INITIAL_CATEGORY_COUNT);
    });

    setSelectedItemsByCategory((prev) => {
      if (Object.keys(prev).length > 0) return prev;

      const initialSelected = {};
      allCategoryNames.slice(0, INITIAL_CATEGORY_COUNT).forEach((category) => {
        initialSelected[category] = closetData[category]?.[0] || null;
      });
      return initialSelected;
    });
  }, []);

  // useEffect(() => {
  //   const selectedItem = paddedItems[selectedSnap];

  //   if (!selectedItem || selectedItem.isBlank) return;

  //   parentSetSelectedCallback?.(selectedItem);
  // }, [selectedSnap, paddedItems, parentSetSelectedCallback]);

  const allCategoryNames = useMemo(
    () => Object.keys(groupedCategories),
    [groupedCategories]
  );

  const remainingCategories = allCategoryNames.filter(
    (category) => !activeCategories.includes(category)
  );

  const selectedItemsInOrder = activeCategories
    .map((categoryName) => selectedItemsByCategory[categoryName])
    .filter(Boolean);

  const handleAddCategory = () => {
    if (
      remainingCategories.length === 0 ||
      activeCategories.length >= MAX_CATEGORY_COUNT
    ) {
      return;
    }

    const nextCategory = remainingCategories[0];

    setActiveCategories((prev) => [...prev, nextCategory]);

    setSelectedItemsByCategory((prev) => ({
      ...prev,
      [nextCategory]: groupedCategories[nextCategory]?.[0] || null,
    }));
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setActiveCategories((prev) =>
      prev.filter((category) => category !== categoryToRemove)
    );

    setSelectedItemsByCategory((prev) => {
      const updated = { ...prev };
      delete updated[categoryToRemove];
      return updated;
    });
  };

  const handleSelectedItemChange = (categoryName, selectedItem) => {
    setSelectedItemsByCategory((prev) => ({
      ...prev,
      [categoryName]: selectedItem,
    }));
  };

  const handlePreview = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#f8f8f8",
        scale: 2,
      });

      const imageData = canvas.toDataURL("image/png");
      setPreviewImage(imageData);
      setOpenOutfitModal(true);
    } catch (error) {
      console.error("Failed to generate preview image:", error);
    }
  };

  if (isLoading) {
    return <main className="p-6">Loading...</main>;
  }

  return (
    <main className="p-6 max-w-[1200px] mx-auto">
      <h1 className="text-[32px] text-center mb-4">Make an Outfit</h1>

      <div className="flex justify-center gap-4 mb-8">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={handlePreview}
          disabled={selectedItemsInOrder.length === 0}
        >
          Preview
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handlePreview}
          disabled={selectedItemsInOrder.length === 0}
        >
          Save the Outfit
        </Button>
      </div>

      <div className="grid grid-cols-[1fr_260px] gap-10 items-start">
        <div className="flex flex-col gap-6">
          {activeCategories.map((categoryName, rowIndex) => (
            <div key={categoryName}>
              <Carousel
                categoryName={categoryName}
                closetItems={groupedCategories[categoryName] || []}
                parentSetSelectedCallback={(selectedItem) =>
                  handleSelectedItemChange(categoryName, selectedItem)
                }
                removalCallback={() => handleRemoveCategory(categoryName)}
                disableRemoval={rowIndex < INITIAL_CATEGORY_COUNT}
              />
            </div>
          ))}

          {remainingCategories.length > 0 &&
            activeCategories.length < MAX_CATEGORY_COUNT && (
              <button
                type="button"
                onClick={handleAddCategory}
                className="w-10 h-10 rounded-full border border-gray-300 text-xl flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
            )}
        </div>

        <div className="sticky top-24">
          <div
            ref={previewRef}
            className="w-[220px] min-h-[560px] border border-[#dcdcdc] bg-[#f8f8f8] p-3 flex flex-col gap-3"
          >
            {activeCategories.map((categoryName) => {
              const selectedItem = selectedItemsByCategory[categoryName];

              return (
                <div
                  key={categoryName}
                  className="border border-[#e3e3e3] bg-white p-2"
                >
                  <div className="text-sm font-semibold mb-2 capitalize">
                    {categoryName}
                  </div>

                  <div className="w-full h-[110px] bg-[#e3e3e3] rounded-[6px] overflow-hidden flex items-center justify-center">
                    {selectedItem?.image ? (
                      <img
                        src={selectedItem.image}
                        alt={selectedItem.name || categoryName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-xs text-gray-500">No image</div>
                    )}
                  </div>

                  <div className="text-xs mt-2 text-center truncate">
                    {selectedItem?.name || "Not selected"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CreateOutfit
        open={openOutfitModal}
        onClose={() => setOpenOutfitModal(false)}
        previewImage={previewImage}
        activeCategories={activeCategories}
        selectedItemsByCategory={selectedItemsByCategory}
      />
    </main>
  );
}

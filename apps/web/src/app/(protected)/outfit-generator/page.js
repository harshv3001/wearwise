"use client";

import { useEffect, useMemo, useState } from "react";
import Carousel from "../../../features/carousel/component/Carousel.jsx";
import { useClosetItemsQuery } from "../../../features/closet/hooks/useClosetItemsQuery.js";
import Button from "../../components/ui/Button.jsx";

const INITIAL_CATEGORY_COUNT = 3;

export default function OutfitGeneratorPage() {
  const { data: allClosetItems, isLoading } = useClosetItemsQuery();

  const [groupedCategories, setGroupedCategories] = useState({});
  const [activeCategories, setActiveCategories] = useState([]);

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
  }, [allClosetItems]);

  const allCategoryNames = useMemo(
    () => Object.keys(groupedCategories),
    [groupedCategories]
  );

  const remainingCategories = allCategoryNames.filter(
    (category) => !activeCategories.includes(category)
  );

  const handleAddCategory = () => {
    if (remainingCategories.length === 0) return;

    setActiveCategories((prev) => [...prev, remainingCategories[0]]);
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setActiveCategories((prev) =>
      prev.filter((category) => category !== categoryToRemove)
    );
  };

  if (isLoading) {
    return <main className="p-6">Loading...</main>;
  }

  return (
    <main className="p-6 max-w-[700px] mx-auto">
      <h1 className="text-[32px] text-center mb-8">Make an Outfit</h1>

      <div className="flex flex-col gap-8 ml-16">
        {activeCategories.map((categoryName, index) => (
          <div key={categoryName}>
            <Carousel
              categoryName={categoryName}
              closetItems={groupedCategories[categoryName] || []}
              parentSetSelectedCallback={() => {}}
              removalCallback={() => handleRemoveCategory(categoryName)}
              disableRemoval={index < INITIAL_CATEGORY_COUNT}
            />
          </div>
        ))}
        <div className="flex items-center justify-between">
          {remainingCategories.length > 0 && (
            <button
              type="button"
              onClick={handleAddCategory}
              className="w-10 h-10 rounded-full border border-gray-300 text-xl flex items-center justify-center hover:bg-gray-100"
            >
              +
            </button>
          )}
          <div>
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
      </div>
    </main>
  );
}

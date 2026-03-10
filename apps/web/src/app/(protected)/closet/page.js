"use client";
import { useEffect, useState } from "react";
import { useClosetItemsQuery } from "@/features/closet/hooks/useClosetItemsQuery";
import Carousel from "../../../features/carousel/component/Carousel.jsx";
import Accordion from "../../components/ui/Accordion/Accordion.jsx";

export default function ClosetPage() {
  const [categories, setCategories] = useState({});
  const { data: allClosetItems } = useClosetItemsQuery();

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

    setCategories(closetData);
  }, [allClosetItems]);

  const categoryNames = Object.keys(categories);

  const columnCount = 2;
  const midpoint = Math.ceil(categoryNames.length / columnCount);

  const leftColumn = categoryNames.slice(0, midpoint);
  const rightColumn = categoryNames.slice(midpoint);

  const columns = [leftColumn, rightColumn];

  return (
    <main className="px-2">
      <div className="text-[32px] text-center mb-8">My Closet</div>

      {allClosetItems ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-[90vw] mx-auto">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-6">
              {column.map((categoryName, i) => {
                const props = {
                  categoryName,
                  closetItems: categories[categoryName],
                  parentSetSelectedCallback: () => {},
                  removalCallback: () => {},
                };

                return (
                  <Accordion
                    key={categoryName}
                    title={categoryName}
                    startOpened={columnIndex === 0 && i === 0}
                  >
                    <Carousel disableRemoval hideTitle {...props} />
                  </Accordion>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}
    </main>
  );
}

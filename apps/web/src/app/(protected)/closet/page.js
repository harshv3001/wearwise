"use client";
import { useMemo, useState } from "react";
import { useClosetItemsQuery } from "@/features/closet/hooks/useClosetItemsQuery";
import Button from "../../components/ui/Button.jsx";
import CreateClosetItem from "../../../features/closet/component/CreateClosetItem.jsx";
import ClosetAccordion from "@/app/components/closet/ClosetAccordion.jsx";
import { groupClosetItemsByCategory } from "@/app/components/closet/closetCategoryUtils.js";

export default function ClosetPage() {
  const [openItemModal, setOpenItemModal] = useState(false);

  const { data: allClosetItems } = useClosetItemsQuery();

  const categories = useMemo(
    () => groupClosetItemsByCategory(allClosetItems || []),
    [allClosetItems]
  );
  const categoryNames = Object.keys(categories);

  const columnCount = 2;
  const midpoint = Math.ceil(categoryNames.length / columnCount);

  const leftColumn = categoryNames.slice(0, midpoint);
  const rightColumn = categoryNames.slice(midpoint);

  const columns = [leftColumn, rightColumn];

  return (
    <main className="p-2">
      <div className="flex flex-col mb-8 items-center justify-center">
        <div className="text-[32px] text-center mb-8">My Closet</div>
        <Button
          variant="secondary"
          size="lg"
          className="ml-auto"
          onClick={() => setOpenItemModal(true)}
        >
          Add Items
        </Button>
      </div>

      {allClosetItems ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-[90vw] mx-auto">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-6">
              <ClosetAccordion
                categoryNames={column}
                categoriesByName={categories}
                defaultOpenCategory={columnIndex === 0 ? column[0] : undefined}
              />
            </div>
          ))}
        </div>
      ) : (
        <></>
      )}
      <CreateClosetItem
        open={openItemModal}
        onClose={() => setOpenItemModal(false)}
      />
    </main>
  );
}

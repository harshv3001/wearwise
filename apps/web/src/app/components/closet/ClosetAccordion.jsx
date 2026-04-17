"use client";

import Accordion from "../ui/Accordion/Accordion";
import Carousel from "@/features/carousel/component/Carousel/Carousel";

export default function ClosetAccordion({
  categoryNames = [],
  categoriesByName = {},
  defaultOpenCategory,
  onItemFocus,
  onItemClick,
  getCarouselProps,
  renderCategoryFooter,
}) {
  return (
    <div className="flex flex-col gap-4">
      {categoryNames.map((categoryName, index) => {
        const carouselProps = getCarouselProps?.(categoryName) || {};
        const shouldDisableItemLinks =
          Boolean(onItemClick) && carouselProps.getItemHref === undefined;

        return (
          <Accordion
            key={categoryName}
            title={categoryName}
            startOpened={
              defaultOpenCategory
                ? defaultOpenCategory === categoryName
                : index === 0
            }
          >
            <div className="flex flex-col gap-3">
              <Carousel
                categoryName={categoryName}
                closetItems={categoriesByName[categoryName] || []}
                parentSetSelectedCallback={(item) =>
                  onItemFocus?.(categoryName, item)
                }
                onItemClick={(item) => onItemClick?.(categoryName, item)}
                onItemDragStart={(event, item) =>
                  carouselProps.onItemDragStart?.(event, item, categoryName)
                }
                getItemHref={
                  shouldDisableItemLinks ? () => null : carouselProps.getItemHref
                }
                removalCallback={() => {}}
                disableRemoval
                hideTitle
                {...carouselProps}
              />
              {renderCategoryFooter?.(categoryName)}
            </div>
          </Accordion>
        );
      })}
    </div>
  );
}

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";
import Link from "next/link";

import styles from "./Carousel.module.scss";
import "./CarouselCardVisibility.scss";

const BLANK_ITEM = { id: "__blank__", name: "", image: null, isBlank: true };

function padItems(closetItems) {
  if (closetItems.length === 0) return closetItems;
  if (closetItems.length === 1) return [BLANK_ITEM, closetItems[0], BLANK_ITEM];
  if (closetItems.length === 2)
    return [closetItems[0], closetItems[1], BLANK_ITEM];
  return closetItems;
}

export default function Carousel({
  closetItems = [],
  categoryName,
  removalCallback,
  parentSetSelectedCallback,
  disableRemoval,
  hideTitle,
}) {
  const paddedItems = padItems(closetItems);
  const isSingleItem = closetItems.length === 1;

  const startIndex = isSingleItem ? 1 : 0;
  const [selectedSnap, setSelectedSnap] = useState(startIndex);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      startIndex,
    },
    [ClassNames()]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi || !paddedItems.length) return;

    const snap = emblaApi.selectedScrollSnap();
    setSelectedSnap(snap);

    const selectedItem = paddedItems[snap];
    if (selectedItem && !selectedItem.isBlank) {
      parentSetSelectedCallback(selectedItem.id);
    }
  }, [emblaApi, paddedItems, parentSetSelectedCallback]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const prevIndex =
    selectedSnap === 0 ? paddedItems.length - 1 : selectedSnap - 1;
  const nextIndex =
    selectedSnap === paddedItems.length - 1 ? 0 : selectedSnap + 1;
  const isPrevBlank = paddedItems[prevIndex]?.isBlank ?? false;
  const isNextBlank = paddedItems[nextIndex]?.isBlank ?? false;

  const determineSlideInnerClassName = useCallback(
    (index) => {
      let className = "carousel-slide-inner";

      if (paddedItems.length < 3) return className;

      if (index === prevIndex) className += " view-left";
      else if (index === nextIndex) className += " view-right";

      return className;
    },
    [paddedItems.length, prevIndex, nextIndex]
  );

  const renderSlides = () =>
    paddedItems.map((closetItem, index) => (
      <div
        className={`${styles.embla__slide}`}
        key={`${closetItem?.id}-${index}`}
      >
        {closetItem.isBlank ? (
          <div
            className={`${determineSlideInnerClassName(index)} ${
              styles.blankSlide
            }`}
          />
        ) : (
          <Link
            className={determineSlideInnerClassName(index)}
            href={`/closet/${closetItem?.id}`}
          >
            {closetItem?.image ? (
              <span>{closetItem?.name}</span>
            ) : (
              <>
                <img
                  src="brown-fall-jacket.jpg"
                  className={styles.outfitItemBox}
                  alt={closetItem?.name}
                />
                <div className="font-bold">{closetItem?.name}</div>
              </>
            )}
          </Link>
        )}
      </div>
    ));

  return (
    <div className="carousel">
      <div className={styles.carousel_header}>
        {!hideTitle ? <h4 className="capitalize">{categoryName}</h4> : null}

        {!disableRemoval ? (
          <button onClick={removalCallback} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">
              remove
            </span>
          </button>
        ) : null}
      </div>

      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>{renderSlides()}</div>
      </div>

      <div className={styles.button_container}>
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={isPrevBlank}
          aria-disabled={isPrevBlank}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            chevron_left
          </span>
        </button>

        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          disabled={isNextBlank}
          aria-disabled={isNextBlank}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}

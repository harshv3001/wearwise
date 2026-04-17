import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";
import Link from "next/link";

import styles from "./Carousel.module.scss";
import "../CarouselCardVisibility.scss";
import ImageWithFallback from "@/app/components/ui/ImageWithFallback/ImageWithFallback";

const BLANK_ITEM = { id: "__blank__", name: "", image: null, isBlank: true };

function padItems(closetItems) {
  if (closetItems.length === 0) return closetItems;
  if (closetItems.length === 1) return [BLANK_ITEM, closetItems[0], BLANK_ITEM];
  if (closetItems.length === 2)
    return [BLANK_ITEM, closetItems[0], closetItems[1]];
  return closetItems;
}

export default function Carousel({
  closetItems = [],
  categoryName,
  removalCallback,
  parentSetSelectedCallback,
  disableRemoval,
  hideTitle,
  hideHeader,
  onItemClick,
  onItemDragStart,
  enableCarouselDrag = true,
  getItemHref = (closetItem) => `/closet/${closetItem?.id}`,
}) {
  const paddedItems = useMemo(() => padItems(closetItems), [closetItems]);
  const isSingleItem = closetItems.length === 1;
  const shouldEnableFullLoop = closetItems.length > 2;
  const shouldUseDirectionalSwipe = closetItems.length === 2;
  const parentSetSelectedCallbackRef = useRef(parentSetSelectedCallback);
  const pointerStateRef = useRef({
    pointerId: null,
    startX: null,
    swiped: false,
  });

  const startIndex = isSingleItem || shouldUseDirectionalSwipe ? 1 : 0;
  const [selectedSnap, setSelectedSnap] = useState(startIndex);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: shouldEnableFullLoop,
      align: "center",
      startIndex,
      watchDrag: shouldEnableFullLoop && enableCarouselDrag,
    },
    [ClassNames()]
  );

  useEffect(() => {
    parentSetSelectedCallbackRef.current = parentSetSelectedCallback;
  }, [parentSetSelectedCallback]);

  const onSelect = useCallback(() => {
    if (!emblaApi || !paddedItems.length) return;

    const snap = emblaApi.selectedScrollSnap();
    setSelectedSnap((prev) => (prev === snap ? prev : snap));

    const selectedItem = paddedItems[snap];
    if (selectedItem && !selectedItem.isBlank) {
      parentSetSelectedCallbackRef.current(selectedItem);
    }
  }, [emblaApi, paddedItems]);

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

  const handleViewportPointerDown = useCallback(
    (event) => {
      if (!shouldUseDirectionalSwipe) return;
      pointerStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        swiped: false,
      };
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [shouldUseDirectionalSwipe]
  );

  const handleViewportPointerMove = useCallback(
    (event) => {
      if (!shouldUseDirectionalSwipe) return;

      const { pointerId, startX, swiped } = pointerStateRef.current;
      if (pointerId !== event.pointerId || startX === null || swiped) return;

      const deltaX = event.clientX - startX;
      if (Math.abs(deltaX) < 30) return;

      if (deltaX > 0) {
        if (!isPrevBlank) {
          emblaApi?.scrollPrev();
        }
      } else if (!isNextBlank) {
        emblaApi?.scrollNext();
      }

      pointerStateRef.current = {
        pointerId,
        startX,
        swiped: true,
      };
    },
    [emblaApi, isNextBlank, isPrevBlank, shouldUseDirectionalSwipe]
  );

  const handleViewportPointerUp = useCallback(
    (event) => {
      if (!shouldUseDirectionalSwipe) return;
      if (pointerStateRef.current.pointerId === event.pointerId) {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }
      pointerStateRef.current = {
        pointerId: null,
        startX: null,
        swiped: false,
      };
    },
    [shouldUseDirectionalSwipe]
  );

  const resetDirectionalSwipe = useCallback(() => {
    pointerStateRef.current = {
      pointerId: null,
      startX: null,
      swiped: false,
    };
  }, []);

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
          (() => {
            const href =
              typeof getItemHref === "function"
                ? getItemHref(closetItem)
                : null;
            const slideClassName = determineSlideInnerClassName(index);
            const slideContent = (
              <>
                <ImageWithFallback
                  imageUrl={closetItem?.image_url}
                  alt={closetItem?.name}
                  fallbackText={closetItem?.name}
                  imgClassName={styles.outfitItemBox}
                />
                <div className={styles.closetItemName}>{closetItem?.name}</div>
              </>
            );

            if (href) {
              return (
                <Link className={slideClassName} href={href}>
                  {slideContent}
                </Link>
              );
            }

            return (
              <button
                type="button"
                className={slideClassName}
                onClick={() => onItemClick?.(closetItem)}
                draggable={Boolean(onItemDragStart)}
                onDragStart={(event) => onItemDragStart?.(event, closetItem)}
              >
                {slideContent}
              </button>
            );
          })()
        )}
      </div>
    ));

  const showHeader = !hideHeader && (!hideTitle || !disableRemoval);

  return (
    <div className="carousel">
      {showHeader && (
        <div className={styles.carousel_header}>
          {!hideTitle ? <h4>{categoryName}</h4> : null}

          {!disableRemoval ? (
            <button onClick={removalCallback} type="button">
              <span className="material-symbols-outlined" aria-hidden="true">
                remove
              </span>
            </button>
          ) : null}
        </div>
      )}

      <div
        className={styles.embla__viewport}
        ref={emblaRef}
        onPointerDown={handleViewportPointerDown}
        onPointerMove={handleViewportPointerMove}
        onPointerUp={handleViewportPointerUp}
        onPointerCancel={resetDirectionalSwipe}
        onPointerLeave={resetDirectionalSwipe}
      >
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

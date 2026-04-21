"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./OutfitItemsCarousel.module.scss";
import { ImageWithFallback } from "@/app/components/ui/display";

function joinClasses(...classNames) {
  return classNames.filter(Boolean).join(" ");
}

export default function OutfitItemsCarousel({ items = [], classNames = {} }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    dragFree: false,
    containScroll: "trimSnaps",
    loop: false,
    duration: 30,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    updateButtons();
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);

    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  return (
    <div className={joinClasses(styles.itemsCarouselRow, classNames.root)}>
      <button
        type="button"
        className={joinClasses(styles.carouselArrow, classNames.arrow)}
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Previous items"
      >
        <span className="material-symbols-outlined">arrow_back_ios</span>
      </button>

      <div className={joinClasses(styles.embla, classNames.embla)}>
        <div
          className={joinClasses(styles.emblaViewport, classNames.viewport)}
          ref={emblaRef}
        >
          <div
            className={joinClasses(styles.emblaContainer, classNames.container)}
          >
            {items.map((item, itemIndex) => (
              <div
                key={`item-${itemIndex}-${item?.id}`}
                className={joinClasses(styles.emblaSlide, classNames.slide)}
              >
                <div
                  className={joinClasses(
                    styles.outfitItemCard,
                    classNames.card
                  )}
                >
                  <ImageWithFallback
                    imageUrl={item?.image_url}
                    alt={item?.name}
                    fallbackText={item?.name}
                    imgClassName={joinClasses(
                      styles.outfitItemBox,
                      classNames.image
                    )}
                  />
                  <div
                    className={joinClasses(
                      styles.outfitItemName,
                      classNames.name
                    )}
                  >
                    {item?.name}
                  </div>
                  <div
                    className={joinClasses(
                      styles.outfitItemSub,
                      classNames.sub
                    )}
                  >
                    {item?.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        className={joinClasses(styles.carouselArrow, classNames.arrow)}
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label="Next items"
      >
        <span className="material-symbols-outlined">arrow_forward_ios</span>
      </button>
    </div>
  );
}

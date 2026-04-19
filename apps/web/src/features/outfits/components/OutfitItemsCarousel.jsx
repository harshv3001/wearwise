"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./ReportOutfitModal/ReportOutfitModal.module.scss";
import { ImageWithFallback } from "@/app/components/ui/display";

export default function OutfitItemsCarousel({ items = [] }) {
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
    <div className={styles.itemsCarouselRow}>
      <button
        type="button"
        className={styles.carouselArrow}
        onClick={scrollPrev}
        disabled={!canScrollPrev}
        aria-label="Previous items"
      >
        <span className="material-symbols-outlined">arrow_back_ios</span>
      </button>

      <div className={styles.embla}>
        <div className={styles.emblaViewport} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {items.map((item, itemIndex) => (
              <div
                key={`item-${itemIndex}-${item?.id}`}
                className={styles.emblaSlide}
              >
                <div className={styles.outfitItemCard}>
                  <ImageWithFallback
                    imageUrl={item?.image_url}
                    alt={item?.name}
                    fallbackText={item?.name}
                    imgClassName={styles.outfitItemBox}
                  />
                  <div className={styles.outfitItemName}>{item?.name}</div>
                  <div className={styles.outfitItemSub}>{item?.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        className={styles.carouselArrow}
        onClick={scrollNext}
        disabled={!canScrollNext}
        aria-label="Next items"
      >
        <span className="material-symbols-outlined">arrow_forward_ios</span>
      </button>
    </div>
  );
}

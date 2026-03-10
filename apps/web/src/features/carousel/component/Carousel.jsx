import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";
import Link from "next/link";

import styles from "./Carousel.module.scss";
import "./CarouselCardVisibility.scss";

export default function Carousel({
  closetItems = [],
  categoryName,
  removalCallback,
  parentSetSelectedCallback,
  disableRemoval,
  hideTitle,
}) {
  const isStaticView = closetItems.length < 3;
  const [selectedSnap, setSelectedSnap] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
    },
    [ClassNames()]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi || !closetItems.length) return;

    const snap = emblaApi.selectedScrollSnap();
    setSelectedSnap(snap);

    const selectedItem = closetItems[snap];
    if (selectedItem) {
      parentSetSelectedCallback(selectedItem.id);
    }
  }, [emblaApi, closetItems, parentSetSelectedCallback]);

  useEffect(() => {
    if (!emblaApi || isStaticView) return;

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect, isStaticView]);

  const determineSlideInnerClassName = useCallback(
    (index) => {
      let className = "carousel-slide-inner";

      if (closetItems.length < 3) {
        return className;
      }

      const prevIndex =
        selectedSnap === 0 ? closetItems.length - 1 : selectedSnap - 1;

      const nextIndex =
        selectedSnap === closetItems.length - 1 ? 0 : selectedSnap + 1;

      if (index === prevIndex) {
        className += " view-left";
      } else if (index === nextIndex) {
        className += " view-right";
      }

      return className;
    },
    [selectedSnap, closetItems.length]
  );

  const renderSlides = () =>
    closetItems.map((closetItem, index) => (
      <div
        className={`${styles.embla__slide} ${isStaticView ? "is-snapped" : ""}`}
        key={closetItem?.id}
      >
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
      </div>
    ));

  return (
    <div className="carousel">
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

      {isStaticView ? (
        <div className={styles.static_container}>{renderSlides()}</div>
      ) : (
        <>
          <div className={styles.embla__viewport} ref={emblaRef}>
            <div className={styles.embla__container}>{renderSlides()}</div>
          </div>

          <div className={styles.button_container}>
            <button type="button" onClick={() => emblaApi?.scrollPrev()}>
              <span className="material-symbols-outlined" aria-hidden="true">
                chevron_left
              </span>
            </button>

            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              className=""
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                chevron_right
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

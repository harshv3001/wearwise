import { useState, useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import ClassNames from 'embla-carousel-class-names';
import Link from 'next/link';

import { useClosetItemsQuery } from '../../closet/hooks/useClosetItemsQuery.js' 
import styles from './Carousel.module.scss';
import './CarouselCardVisibility.scss';

// PROPS should have a data member with an array of closetitems. e.g. {
//      data: [ {ClosetItem}, {ClosetItem} ]
// }
export default function Carousel({ 
    closetItems, 
    categoryName, 
    removalCallback, parentSetSelectedCallback, 
    disableRemoval, hideTitle
}) {
    const TRY_DISPLAY_FIVE = false;
    const [selectedSnap, setSelectedSnap] = useState(0)

    const [emblaRef, emblaApi] = useEmblaCarousel({ 
        loop: true,
        align: 'center'
    }, [ClassNames()]);

    const remove = useCallback(() => {removalCallback()}, [removalCallback]);

    const onSelect = (emblaApi, event) => { 
        parentSetSelectedCallback(closetItems[emblaApi.selectedScrollSnap()].id);
        setSelectedSnap(emblaApi.selectedScrollSnap); 
    };

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        return () => { emblaApi.off('select', onSelect); };
    }, [emblaApi, selectedSnap]);


    const determineSlideInnerClassName = i => {
        let innerClassName = "carousel-slide-inner"
        
        if ((selectedSnap == 0 && i == closetItems.length - 1) || (i == selectedSnap - 1)) {
            innerClassName = innerClassName.concat(" view-left");
        } else if ((selectedSnap == closetItems.length - 1 && i == 0) || (i == selectedSnap + 1)) {
            innerClassName = innerClassName.concat(" view-right");
        } else if (TRY_DISPLAY_FIVE) {
            if ((selectedSnap == 0 && i == closetItems.length - 2) || (selectedSnap == 1 && i == closetItems.length - 1) || (i == selectedSnap - 2)) {
            innerClassName = innerClassName.concat(" view-left2");
            } else if ((selectedSnap == closetItems.length - 1 && i == 1) || (selectedSnap == closetItems.length - 2 && i == 0) || (i == selectedSnap + 2)) {
                innerClassName = innerClassName.concat(" view-right2");
            }
        }
        return innerClassName;
    };

    return (
        <div className="carousel">

            <div className={styles.carousel_header}>
                {
                    !hideTitle ? (
                        <h4>{categoryName}</h4>
                    ) : (<></>)
                }
                {
                    !disableRemoval ? (
                        <button onClick={remove}>
                            <span className="material-symbols-outlined" aria-hidden="true">
                                remove
                            </span>
                        </button>
                    ) : (<></>)
                }
            </div>

            <div className={styles.embla__viewport} ref={emblaRef}>
                <div className={styles.embla__container}>
                    {   closetItems ? 
                        closetItems.map((closetItem, i) => {
                            return (
                                <div className={styles.embla__slide} key={closetItem.id}>
                                    <Link className={determineSlideInnerClassName(i)} href={`/closet-items/${closetItem.id}`}>
                                        {
                                            !closetItem.image ? 
                                            (<span>{closetItem.name}</span>) 
                                            : 
                                            (<img href={closetItem.image} alt={closetItem.name}/>)
                                        }
                                    </Link>
                                </div>
                            )
                        }) : (<></>)
                    }
                </div>
            </div>
            
            <div className={styles.button_container}>
                <button onClick={() => {emblaApi.scrollPrev();}}>
                <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_left
                </span>
                </button>
                
                <button onClick={() => {emblaApi.scrollNext();}}>
                <span className="material-symbols-outlined" aria-hidden="true">
                    chevron_right
                </span>
                </button>
            </div>
        </div>
    );
}


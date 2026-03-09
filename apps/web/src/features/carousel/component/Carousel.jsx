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
export default function Carousel({ data, categoryName, removalCallback }) {
    console.log(data);
    const [selectedSnap, setSelectedSnap] = useState(0)
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
        loop: true,
        align: 'center'
    }, [ClassNames()]);
    
    const remove = useCallback(() => {removalCallback()}, [removalCallback]);
    const onSelect = (emblaApi, event) => { setSelectedSnap(emblaApi.selectedScrollSnap); };

    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on('select', onSelect);
        return () => { emblaApi.off('select', onSelect); };
    }, [emblaApi, selectedSnap]);

    const determineSlideInnerClassName = i => {
        let innerClassName = "carousel-slide-inner"
        
        if ((selectedSnap == 0 && i == data.length - 1) || (i == selectedSnap - 1)) {
            innerClassName = innerClassName.concat(" view-left");
        } else if ((selectedSnap == data.length - 1 && i == 0) || (i == selectedSnap + 1)) {
            innerClassName = innerClassName.concat(" view-right");
        }
        return innerClassName;
    };
    
    return (
        <div className="carousel">
            <div className={styles.carousel_header}>
                <h4>{categoryName}</h4>
                
                <button onClick={remove}>
                    <span className="material-symbols-outlined" aria-hidden="true">
                        remove
                    </span>
                </button>
            </div>
            <div className={styles.embla__viewport} ref={emblaRef}>
                <div className={styles.embla__container}>
                    {   data ? 
                        data.map((closetItem, i) => {
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
        </div>
    );
}


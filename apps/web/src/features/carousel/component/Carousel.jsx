'use client';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { useClosetItemsQuery } from '../../closet/hooks/useClosetItemsQuery.js' 
import styles from './Carousel.module.scss';

// PROPS should have a data member with an array of closetitems. e.g. {
//      data: [ {ClosetItem}, {ClosetItem} ]
// }
export default function Carousel(props) {

    // destructure data from props
    const { data } = useClosetItemsQuery("hat");
    console.log(data);
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
    const prevSlide = () => emblaApi?.scrollPrev();
    const nextSlide = () => emblaApi?.scrollNext();

    // should be - for each item in data, create thumbnail with image/placeholder and link to closetitem
    return (
        <div className="embla">
            <div className={styles.embla__viewport} ref={emblaRef}>
                <div className={styles.embla__container}>
                    <div className={styles.embla__slide}>s1</div>
                    <div className={styles.embla__slide}>s2</div>
                    <div className={styles.embla__slide}>s3</div>
                    <div className={styles.embla__slide}>s4</div>
                </div>
            </div>
            <button className="embla__prev" onClick={prevSlide}>prev</button>
            <button className="embla__next" onClick={nextSlide}>next</button>
        </div>
    );
}

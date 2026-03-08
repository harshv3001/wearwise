'use client';
import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import styles from './Carousel.module.scss';

export default function Carousel({}) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
    const prevSlide = () => emblaApi?.scrollPrev();
    const nextSlide = () => emblaApi?.scrollNext();

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

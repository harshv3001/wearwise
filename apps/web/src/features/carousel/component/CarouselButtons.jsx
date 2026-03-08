import { useCallback, useEffect, useState } from 'react';

export const useButtons = (emblaApi) => {
    const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
    const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

    const nextSlide = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.goToNext();
    }, [emblaApi]);

    const prevSlide = useCallback(() => {
        if (!emblaApi) return;
        emblaApi.goToPrev();
    }, [emblaApi]);

    const onSelect = useCallback((emblaApi) => {
        if (!emblaApi) return;
        console.log(emblaApi)
        setPrevBtnDisabled(!emblaApi.canGoToPrev())
        setNextBtnDisabled(!emblaApi.canGoToNext())
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect(emblaApi)
        emblaApi.on('reinit', onSelect).on('select', onSelect)
    }, [emblaApi, onSelect])

    return {
        prevBtnDisabled,
        nextBtnDisabled,
        prevSlide,
        nextSlide
    };
}

export const CarouselNavButton = (props) => {
    const { children, ...restprops } = props
    return (
        <button>
            { children }
        </button>
    );
}

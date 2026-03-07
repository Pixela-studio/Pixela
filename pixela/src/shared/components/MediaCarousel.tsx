"use client";

import { useCallback, useEffect, useState, ReactNode, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { SliderNavButton } from "@/shared/components/SliderNavButton";
import clsx from "clsx";

const STYLES = {
  container: "relative",
  carousel: {
    base: "embla overflow-hidden w-full cursor-grab touch-pan-y",
    dragging: "cursor-grabbing",
  },
  slides: "embla__container will-change-transform transform-gpu",
  navButton: "top-[50%]",
  icon: "h-6 w-6",
} as const;

const CAROUSEL_OPTIONS = {
  loop: true,
  align: "start" as const,
  skipSnaps: false,
  dragFree: true,
  containScroll: "trimSnaps" as const,
  slidesToScroll: 1,
} as const;

interface MediaCarouselProps {
  children: ReactNode;
  autoplay?: boolean;
  autoplayInterval?: number;
  slidesClassName?: string;
  className?: string;
  initialIndex?: number;
}

/**
 * Componente de carrusel de medios con soporte para autoplay y navegación
 * @param {MediaCarouselProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de carrusel
 */
export const MediaCarousel = ({
  children,
  autoplay = true,
  autoplayInterval = 6000,
  slidesClassName = "",
  className = "",
  initialIndex = 0,
}: MediaCarouselProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const carouselOptions = useMemo(
    () => ({
      ...CAROUSEL_OPTIONS,
      startIndex: initialIndex,
    }),
    [initialIndex],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(carouselOptions);

  useEffect(() => {
    if (!emblaApi) return;

    const onDragStart = () => setIsDragging(true);
    const onDragEnd = () => setIsDragging(false);

    emblaApi.on("pointerDown", onDragStart);
    emblaApi.on("pointerUp", onDragEnd);

    return () => {
      emblaApi.off("pointerDown", onDragStart);
      emblaApi.off("pointerUp", onDragEnd);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !autoplay) return;

    let intervalId: NodeJS.Timeout;

    const startAutoplay = () => {
      clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!document.hidden) {
          emblaApi.scrollNext();
        }
      }, autoplayInterval);
    };

    startAutoplay();
    emblaApi.on("pointerUp", startAutoplay);
    document.addEventListener("visibilitychange", startAutoplay);

    return () => {
      clearInterval(intervalId);
      emblaApi.off("pointerUp", startAutoplay);
      document.removeEventListener("visibilitychange", startAutoplay);
    };
  }, [emblaApi, autoplay, autoplayInterval]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);

  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className={clsx(STYLES.container, className)}>
      <div
        className={clsx(STYLES.carousel.base, {
          [STYLES.carousel.dragging]: isDragging,
        })}
        ref={emblaRef}
      >
        <div className={clsx(STYLES.slides, slidesClassName)}>{children}</div>
      </div>

      <SliderNavButton
        direction="prev"
        onClick={scrollPrev}
        ariaLabel="Anterior"
        icon={<FiChevronLeft className={STYLES.icon} />}
        className={STYLES.navButton}
      />
      <SliderNavButton
        direction="next"
        onClick={scrollNext}
        ariaLabel="Siguiente"
        icon={<FiChevronRight className={STYLES.icon} />}
        className={STYLES.navButton}
      />
    </div>
  );
};

export default MediaCarousel;

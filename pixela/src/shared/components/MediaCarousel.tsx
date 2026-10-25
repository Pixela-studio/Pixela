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
  // Las flechas sobre el póster (no sobre el pie de foto); en táctil sobran.
  navButton: "top-[38%] [@media(hover:none)]:hidden",
  icon: "h-6 w-6",
} as const;

/*
 * Filas de contenido sin bucle ni autoplay: se recorren al ritmo de quien
 * mira (DESIGN.md › Motion). Sin bucle, además, el primer póster arranca en
 * el margen de la página y el último cierra en el margen opuesto.
 */
const CAROUSEL_OPTIONS = {
  loop: false,
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
  autoplay = false,
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
  // Sin bucle, la flecha de un extremo no lleva a ninguna parte: se oculta.
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    emblaApi.on("scroll", update);
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
      emblaApi.off("scroll", update);
    };
  }, [emblaApi]);

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

    // Con el foco del teclado dentro (las tarjetas son enlaces), el autoplay
    // se para: si no, la tarjeta enfocada se desplaza sola fuera de la vista.
    const stopAutoplay = () => clearInterval(intervalId);
    const root = emblaApi.rootNode();

    startAutoplay();
    emblaApi.on("pointerUp", startAutoplay);
    document.addEventListener("visibilitychange", startAutoplay);
    root.addEventListener("focusin", stopAutoplay);
    root.addEventListener("focusout", startAutoplay);

    return () => {
      clearInterval(intervalId);
      emblaApi.off("pointerUp", startAutoplay);
      document.removeEventListener("visibilitychange", startAutoplay);
      root.removeEventListener("focusin", stopAutoplay);
      root.removeEventListener("focusout", startAutoplay);
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

      {canScrollPrev && (
        <SliderNavButton
          direction="prev"
          onClick={scrollPrev}
          ariaLabel="Anterior"
          icon={<FiChevronLeft className={STYLES.icon} />}
          className={STYLES.navButton}
        />
      )}
      {canScrollNext && (
        <SliderNavButton
          direction="next"
          onClick={scrollNext}
          ariaLabel="Siguiente"
          icon={<FiChevronRight className={STYLES.icon} />}
          className={STYLES.navButton}
        />
      )}
    </div>
  );
};

export default MediaCarousel;

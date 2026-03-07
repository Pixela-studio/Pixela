"use client";

import { useRef, useMemo } from "react";
import { TheatricalMovie } from "../types";
import { MediaCarousel } from "@/shared/components/MediaCarousel";
import { TrendingMediaCard } from "@/features/trending/components/content/TrendingMediaCard";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import QuoteSection from "@/features/quotes/components/QuoteSection";
import {
  HEADER_LAYOUT_STYLES,
  HEADER_TYPOGRAPHY_STYLES,
} from "@/shared/styles/headerStyles";

// Estilos adaptados de TrendingHeader
const STYLES = {
  ...HEADER_LAYOUT_STYLES,
  title: `${HEADER_TYPOGRAPHY_STYLES.titleBase} text-left sm:text-right sm:ml-auto`,
  titleMobile: `${HEADER_TYPOGRAPHY_STYLES.titleMobileBase} text-left pl-4`,
  titleDesktop: `${HEADER_TYPOGRAPHY_STYLES.titleDesktopBase} text-right sm:pr-0`,
} as const;

export const TheatricalHeader = ({
  movies,
  quote,
}: {
  movies: TheatricalMovie[];
  quote?: { quote: string; author: string };
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  const animationElements = useMemo(
    () => [
      { ref: titleRef, duration: 0.8, ease: "power2.out" },
      { ref: carouselRef, duration: 0.8, ease: "power2.out", delay: "-=0.3" },
      { ref: quoteRef, duration: 0.6, ease: "power2.out", delay: "-=0.2" },
    ],
    [],
  );

  useScrollAnimation({
    trigger: containerRef,
    triggerStart: "top 80%",
    initialY: 30,
    elements: animationElements,
  });

  if (!movies || movies.length === 0) return null;

  return (
    <div id="cartelera" className={STYLES.container} ref={containerRef}>
      <div className={STYLES.content}>
        {/* Header con estructura idéntica a Tendencias para respetar espacios */}
        <div className={STYLES.headerWrapper}>
          {/* Espaciador flexible para empujar título a la derecha si es necesario */}
          <div className="flex-grow hidden lg:block" />

          <div ref={titleRef} className="w-full sm:w-auto sm:ml-auto">
            <h2 className={STYLES.title}>
              <span className={STYLES.titleMobile}>
                TOP
                <br />
                CINE
              </span>
              <span className={STYLES.titleDesktop}>TOP CARTELERA</span>
            </h2>
          </div>
        </div>

        {/* Carrusel */}
        <div ref={carouselRef} className={STYLES.carouselWrapper}>
          <MediaCarousel
            className="trending-carousel mx-0"
            slidesClassName={STYLES.slides}
          >
            {movies.map((movie, index) => (
              <div key={movie.id} className={STYLES.slide}>
                <TrendingMediaCard media={movie} type="movies" index={index} />
              </div>
            ))}
          </MediaCarousel>
        </div>

        {/* Cita justificada a la izquierda */}
        {quote && (
          <div ref={quoteRef}>
            <QuoteSection quote={quote} align="left" />
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import { useRef, useMemo, useState } from "react";
import { WeekendMovie, WeekendSerie } from "../types";
import { MediaCarousel } from "@/shared/components/MediaCarousel";
import { TrendingMediaCard } from "@/features/trending/components/content/TrendingMediaCard";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { TrendingButton } from "@/features/trending/components/ui/TrendingButton";
import QuoteSection from "@/features/quotes/components/QuoteSection";
import {
  HEADER_LAYOUT_STYLES,
  HEADER_TYPOGRAPHY_STYLES,
} from "@/shared/styles/headerStyles";

// Estilos similares a TheatricalHeader pero alineados a la izquierda
const STYLES = {
  ...HEADER_LAYOUT_STYLES,
  title: `${HEADER_TYPOGRAPHY_STYLES.titleBase} text-left`,
  titleMobile: `${HEADER_TYPOGRAPHY_STYLES.titleMobileBase} text-left pl-4`,
  titleDesktop: `${HEADER_TYPOGRAPHY_STYLES.titleDesktopBase} text-left sm:pl-0`,
  headerLeft: "flex flex-col items-start gap-2",
  toggleContainer: "mb-12 md:mb-10 px-4 md:px-0",
  toggleWrapper:
    "flex bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10 relative shadow-lg shadow-black/20 w-full sm:w-auto ipad:w-full",
} as const;

type MediaType = "series" | "movies";

const BUTTON_OPTIONS = [
  { id: "series", label: "Series" },
  { id: "movies", label: "Películas" },
] as const;

interface WeekendHeaderProps {
  movies: WeekendMovie[];
  series: WeekendSerie[];
  quote?: { quote: string; author: string };
}

export const WeekendHeader = ({
  movies,
  series,
  quote,
}: WeekendHeaderProps) => {
  const [activeButton, setActiveButton] = useState<MediaType>("movies");
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  const activeContent = activeButton === "series" ? series : movies;

  const animationElements = useMemo(
    () => [
      { ref: titleRef, duration: 0.8, ease: "power2.out" },
      { ref: toggleRef, duration: 0.6, ease: "power2.out", delay: "-=0.4" },
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

  if (!movies || !series) return null;

  return (
    <div className={STYLES.container} ref={containerRef}>
      <div className={STYLES.content}>
        {/* Header con Título a la izquierda y Toggle a la derecha */}
        <div className={STYLES.headerWrapper}>
          <div className={STYLES.headerLeft} ref={titleRef}>
            <h2 className={STYLES.title}>
              <span className={STYLES.titleMobile}>
                FINDE
                <br />
                CASA
              </span>
              <span className={STYLES.titleDesktop}>FINDE EN CASA</span>
            </h2>
          </div>

          <div className={STYLES.toggleContainer} ref={toggleRef}>
            <div className={STYLES.toggleWrapper}>
              {BUTTON_OPTIONS.map(({ id, label }) => (
                <TrendingButton
                  key={id}
                  isActive={activeButton === id}
                  onClick={() => setActiveButton(id as MediaType)}
                >
                  {label}
                </TrendingButton>
              ))}
            </div>
          </div>
        </div>

        {/* Carrusel */}
        <div ref={carouselRef} className={STYLES.carouselWrapper}>
          <MediaCarousel
            className="trending-carousel mx-0"
            slidesClassName={STYLES.slides}
          >
            {activeContent.map((item, index) => (
              <div key={item.id} className={STYLES.slide}>
                <TrendingMediaCard
                  media={item}
                  type={activeButton}
                  index={index}
                />
              </div>
            ))}
          </MediaCarousel>
        </div>

        {/* Cita justificada a la derecha */}
        {quote && (
          <div ref={quoteRef}>
            <QuoteSection quote={quote} align="right" />
          </div>
        )}
      </div>
    </div>
  );
};

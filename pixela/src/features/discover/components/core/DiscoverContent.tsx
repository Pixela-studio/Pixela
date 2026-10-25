"use client";

import { useRef } from "react";
import Link from "next/link";
import { useCategoriesStore } from "@/features/categories/store/categoriesStore";
import { useDiscoverAnimation } from "@/features/discover/hooks/useDiscoverAnimation";
import { DiscoverBackground } from "@/features/discover/components/layout/DiscoverBackground";

const STYLES = {
  container:
    "relative w-full bg-pixela-dark flex flex-col justify-center overflow-hidden min-h-[85vh] py-24 lg:py-0 ls:py-8",
  backgroundLayer: "absolute inset-0 w-full h-full z-0 pointer-events-none",

  content:
    "relative z-20 w-full px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 flex flex-col items-start justify-center text-left",
  leftSection: "w-full max-w-4xl",

  // El titular entero en Bodoni marfil: sin la última línea en rosa.
  mainHeading:
    "title-card text-[44px] sm:text-6xl lg:text-[72px] 2k:text-[88px] mb-8 flex flex-col [text-wrap:balance]",

  description:
    "text-lg lg:text-xl leading-relaxed text-white/80 max-w-xl mb-10 [text-wrap:pretty]",

  actions: "flex flex-row items-center justify-start gap-8 2k:gap-6",
  exploreButton: "btn btn-primary",
} as const;

interface DiscoverContentProps {
  heading: string[];
}

/**
 * Sección "Descubre" del landing. El fondo con marquees de pósters vive en
 * DiscoverBackground; aquí solo componemos el heading, la descripción y el CTA.
 */
export const DiscoverContent = ({ heading }: DiscoverContentProps) => {
  const setSelectedMediaType = useCategoriesStore(
    (state) => state.setSelectedMediaType,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useDiscoverAnimation({ containerRef, leftSectionRef, gridRef });

  return (
    <div className={STYLES.container}>
      <div className={STYLES.backgroundLayer}>
        <DiscoverBackground />
      </div>

      <div ref={containerRef} className={STYLES.content}>
        <div ref={leftSectionRef} className={STYLES.leftSection}>
          <h2 className={STYLES.mainHeading}>
            {heading.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </h2>

          <p className={STYLES.description}>
            Todo el catálogo de películas y series, por género y con buscador.
            Y si no sabes qué elegir, una selección al azar.
          </p>

          <div className={STYLES.actions}>
            <Link
              href="/categories"
              prefetch={false}
              className={STYLES.exploreButton}
              onClick={() => setSelectedMediaType("series")}
            >
              Explorar catálogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

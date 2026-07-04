"use client";

import { useRef } from "react";
import Link from "next/link";
import { IoIosArrowForward } from "react-icons/io";
import { useCategoriesStore } from "@/features/categories/store/categoriesStore";
import { useDiscoverAnimation } from "@/features/discover/hooks/useDiscoverAnimation";
import { DiscoverBackground } from "@/features/discover/components/layout/DiscoverBackground";

const STYLES = {
  container:
    "relative w-full bg-pixela-dark flex flex-col justify-center overflow-hidden min-h-[85vh] mt-16 px-4 py-16 lg:px-0 lg:py-0 [@media(max-height:500px)_and_(orientation:landscape)]:py-8",
  backgroundLayer: "absolute inset-0 w-full h-full z-0 pointer-events-none",

  content:
    "relative z-20 w-[90%] xl:w-[85%] 2k:w-[70%] mx-auto flex flex-col items-start justify-center text-left",
  leftSection: "w-full max-w-3xl",

  mainHeading:
    "text-5xl sm:text-6xl lg:text-7xl 2k:text-8xl font-black text-white font-outfit leading-[0.9] mb-8 2k:mb-6 flex flex-col gap-0 drop-shadow-2xl tracking-tighter [text-wrap:balance]",
  accentLine: "text-pixela-accent",

  description:
    "text-gray-300 text-lg 2k:text-xl font-light leading-relaxed max-w-xl mb-10 2k:mb-8 [text-wrap:pretty]",
  accentText: "text-white font-medium italic",

  actions: "flex flex-row items-center justify-start gap-8 2k:gap-6",
  exploreButton:
    "group relative px-8 py-4 rounded-full font-bold text-base transition-all duration-500 overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-pixela-accent/50 hover:bg-pixela-accent/10 hover:shadow-[0_0_30px_rgba(236,27,105,0.3)]",
  buttonContent:
    "relative z-10 flex items-center justify-center text-white group-hover:text-pixela-accent transition-colors duration-300",
  buttonIcon:
    "w-5 h-5 ml-2 transition-transform duration-500 group-hover:translate-x-1.5",
  buttonHoverEffect:
    "absolute inset-0 bg-gradient-to-r from-pixela-accent/20 to-transparent w-0 group-hover:w-full transition-all duration-500 ease-out",
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
              <span
                key={index}
                className={`block ${
                  index === heading.length - 1 ? STYLES.accentLine : ""
                }`}
              >
                {line}
              </span>
            ))}
          </h2>

          <p className={STYLES.description}>
            Explora un catálogo seleccionado para{" "}
            <span className={STYLES.accentText}>cautivar</span> tus sentidos y
            sumérgete en narrativas inolvidables que despiertan tu{" "}
            <span className={STYLES.accentText}>imaginación</span>.
          </p>

          <div className={STYLES.actions}>
            <Link
              href="/categories"
              className={STYLES.exploreButton}
              onClick={() => setSelectedMediaType("series")}
            >
              <span className={STYLES.buttonContent}>
                Explorar catálogo
                <IoIosArrowForward className={STYLES.buttonIcon} />
              </span>
              <span className={STYLES.buttonHoverEffect} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

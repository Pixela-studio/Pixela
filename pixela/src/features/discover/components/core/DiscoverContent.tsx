"use client";

import { useState, useRef, useEffect } from "react";
// import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useCategoriesStore } from "@/features/categories/store/categoriesStore";
import { useDiscoverAnimation } from "@/features/discover/hooks/useDiscoverAnimation";
import { IoIosArrowForward } from "react-icons/io";
import Link from "next/link";
import { headings } from "@/features/discover/content/headings";
import { DiscoverBackground } from "@/features/discover/components/layout/DiscoverBackground";

const STYLES = {
  // --- Contenedor y Degradados ---
  container:
    "relative w-full bg-pixela-dark flex flex-col justify-center overflow-hidden",
  gradientContainer: "absolute inset-0 w-full h-full z-0 pointer-events-none",
  mainGradient:
    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] lg:w-[80vw] lg:h-[80vw] lg:left-[75%] 2k:w-[60vw] 2k:h-[60vw] 2k:left-[65%] rounded-full",
  secondaryGradient:
    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] lg:w-[60vw] lg:h-[60vw] lg:left-[75%] 2k:w-[45vw] 2k:h-[45vw] 2k:left-[65%] rounded-full",

  // --- Layout de Escritorio ---
  desktopContainer:
    "min-h-[85vh] relative mt-16 flex items-center justify-center overflow-hidden",
  desktopContent:
    "relative z-20 w-[90%] xl:w-[85%] 2k:w-[70%] mx-auto flex flex-col items-start justify-center text-left pointer-events-none", // pointer-events-none para que el fondo no interfiera, pero habilitaremos el boton
  desktopLeftSection: "w-full max-w-3xl",
  desktopRightSection: "hidden", // Ocultamos la sección derecha (Grid)
  desktopActions:
    "flex flex-row items-center justify-start gap-8 2k:gap-6 mt-10 2k:mt-6 pointer-events-auto", // Reactivamos puntero para botones

  // --- Layout Móvil ---
  mobileContainer: "flex-col items-stretch gap-8 px-4 py-12",

  // --- Tipografía y Contenido ---
  discoverLabel:
    "text-sm font-bold text-pixela-accent uppercase tracking-[0.2em] mb-4 bg-pixela-accent/10 px-3 py-1 rounded w-fit backdrop-blur-sm border border-pixela-accent/20",
  mainHeadingDesktop:
    "text-7xl 2k:text-8xl font-black text-white leading-[0.85] mb-8 2k:mb-6 flex flex-col gap-0 drop-shadow-2xl tracking-tighter",
  // hollowText removed
  mainHeadingMobile:
    "text-6xl font-black text-pixela-accent font-outfit tracking-tighter uppercase leading-none text-left drop-shadow-lg",
  description:
    "text-gray-300 text-lg 2k:text-xl max-w-full text-left font-light leading-relaxed",
  descriptionDesktop: "mb-10 2k:mb-8 mx-0 lg:max-w-xl",
  descriptionMobile: "py-8",
  accentText: "text-white font-medium italic relative",

  // --- Botones y Acciones ---
  exploreButton:
    "group relative px-8 py-4 rounded-full font-bold text-base transition-all duration-500 overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 hover:border-pixela-accent/50 hover:bg-pixela-accent/10 hover:shadow-[0_0_30px_rgba(236,27,105,0.3)]",
  buttonContent:
    "relative z-10 flex items-center justify-center text-white group-hover:text-pixela-accent transition-colors duration-300",
  buttonIcon: "w-5 h-5 ml-2 transition-transform duration-500",
  buttonIconHover: "group-hover:translate-x-1.5",
  buttonHoverEffect:
    "absolute inset-0 bg-gradient-to-r from-pixela-accent/20 to-transparent w-0 group-hover:w-full transition-all duration-500 ease-out",
} as const;

/**
 * Componente principal de la sección de descubrimiento
 * Maneja el estado global de series y películas
 * @returns {JSX.Element} - Elemento JSX que representa el contenido de la sección de descubrimiento
 * @param {DiscoverMediaType} activeType - Tipo de contenido activo (serie o película)
 * @param {Function} setActiveType - Función para actualizar el tipo de contenido activo
 * @param {string} heading - Encabezado de la sección de descubrimiento
 * @param {boolean} isMobile - Indica si la vista es móvil
 * @param {Function} handleExploreClick - Función para manejar el clic en el botón de explorar catálogo
 * @param {React.RefObject<HTMLDivElement>} containerRef - Referencia al contenedor principal
 * @param {React.RefObject<HTMLDivElement>} leftSectionRef - Referencia a la sección izquierda
 * @param {React.RefObject<HTMLDivElement>} gridRef - Referencia al grid de tarjetas
 */
export const DiscoverContent = () => {
  // Removed useMediaQuery to avoid hydration mismatches
  // const isMobile = useMediaQuery("(max-width: 1023px)");
  // const [activeType, setActiveType] = useState<DiscoverMediaType>("serie"); // Removed unused state
  const [heading, setHeading] = useState(headings[0]);

  useEffect(() => {
    setHeading(headings[Math.floor(Math.random() * headings.length)]);
  }, []);

  const setSelectedMediaType = useCategoriesStore(
    (state) => state.setSelectedMediaType,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const leftSectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useDiscoverAnimation({
    containerRef,
    leftSectionRef,
    gridRef,
  });

  const handleExploreClick = () => {
    // Default to series or modify if needed, since activeType selector is removed
    setSelectedMediaType("series");
  };

  /**
   * Contenido de la descripción de la sección de descubrimiento
   * Renderizamos una sola versión y controlamos estilos via CSS si es necesario,
   * o duplicamos si la estructura cambia drásticamente, controlando visibilidad con clases.
   */
  const descriptionContent = (
    <div
      className={`${STYLES.description} mb-8 2k:mb-6 mx-0 lg:max-w-xl p-6 bg-pixela-dark/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl mt-6 lg:mt-0`}
    >
      <p>
        Explora un catálogo seleccionado para{" "}
        <span className={STYLES.accentText}>cautivar</span> tus sentidos y
        sumérgete en narrativas inolvidables que despiertan tu{" "}
        <span className={STYLES.accentText}>imaginación</span>.
      </p>
      <p className="mt-4">
        Ya sea que busques emoción, misterio o inspiración, aquí empieza tu
        próximo viaje cinematográfico.
      </p>
    </div>
  );

  return (
    <div
      className={`${STYLES.container} flex-col items-stretch gap-8 px-4 py-16 lg:min-h-[85vh] lg:mt-16 lg:flex-row lg:items-center lg:justify-center lg:px-0 lg:py-0 [@media(max-height:500px)_and_(orientation:landscape)]:py-8 [@media(max-height:500px)_and_(orientation:landscape)]:gap-4`}
    >
      {/* --- Fondo para ESCRITORIO y MÓVIL (Visible Always) --- */}
      <div className={`${STYLES.gradientContainer}`}>
        <DiscoverBackground />
      </div>

      {/* --- Contenido para MÓVIL (Visible only on lg and below) --- */}
      <div className="flex flex-col lg:hidden w-full relative z-10 [@media(max-height:500px)_and_(orientation:landscape)]:flex-row [@media(max-height:500px)_and_(orientation:landscape)]:items-center [@media(max-height:500px)_and_(orientation:landscape)]:gap-6">
        <h2 className={STYLES.mainHeadingMobile}>
          DES-
          <br />
          CUBRE
        </h2>
        {descriptionContent}
        <Link
          href="/categories"
          className={`${STYLES.exploreButton} w-full`}
          onClick={handleExploreClick}
        >
          <span className={STYLES.buttonContent}>
            Explorar catálogo
            <IoIosArrowForward className={STYLES.buttonIcon} />
          </span>
        </Link>
      </div>

      {/* --- Contenido para ESCRITORIO (Hidden on Mobile) --- */}
      <div
        ref={containerRef}
        className={`${STYLES.desktopContent} hidden lg:flex`}
      >
        <div ref={leftSectionRef} className={STYLES.desktopLeftSection}>
          <p className={STYLES.discoverLabel}>DESCUBRE</p>
          <h2 className={STYLES.mainHeadingDesktop}>
            {heading.map((line, index) => (
              <span
                key={index}
                className={`block ${
                  index === heading.length - 1 ? "text-pixela-accent" : ""
                }`}
              >
                {line}
              </span>
            ))}
          </h2>
          {descriptionContent}
          <div className={STYLES.desktopActions}>
            <Link
              href="/categories"
              className={`${STYLES.exploreButton} w-auto`}
              onClick={handleExploreClick}
            >
              <span className={STYLES.buttonContent}>
                Explorar catálogo
                <IoIosArrowForward
                  className={`${STYLES.buttonIcon} ${STYLES.buttonIconHover}`}
                />
              </span>
              <span className={STYLES.buttonHoverEffect} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

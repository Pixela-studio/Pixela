"use client";
import "../trending.css";
import { useState, memo, useRef, useMemo } from "react";
import { useTrendingStore } from "@/features/trending/store/trendingStore";
import { TrendingMediaCarousel } from "../layout/TrendingMediaCarousel";
import { TrendingButton } from "./TrendingButton";
import { TrendingSerie, TrendingMovie } from "@/features/trending/types";
import clsx from "clsx";
import QuoteSection from "@/features/quotes/components/QuoteSection";
import { MediaType } from "@/features/trending/types/common";
import type { TrendingToggleProps } from "@/features/trending/types/components";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

// Constantes
const STYLES = {
  title:
    "font-black font-outfit tracking-wider uppercase leading-none w-full md:w-auto text-left break-words",
  titleMobile:
    "block sm:hidden text-[64px] leading-[0.95] text-pixela-accent text-left pl-4",
  titleDesktop:
    "hidden sm:block text-[64px] md:text-[80px] lg:text-[80px] xl:text-[96px] 2xl:text-[112px] min-[1920px]:text-[128px] 2k:text-[100px] text-pixela-accent text-left pl-4 sm:pl-0 lg:whitespace-nowrap",
  container:
    "relative w-full min-h-screen 2k:min-h-[80vh] bg-pixela-dark flex flex-col py-16 md:py-0 md:pt-20 2k:pt-12",
  content:
    "flex-grow flex flex-col justify-center md:justify-start relative z-10 md:pb-0 2k:pb-8",
  contentWrapper: "w-[90%] md:w-[85%] lg:w-[80%] 2k:w-[70%] mx-auto",
  contentWrapperWithToggle:
    "relative w-full bg-pixela-dark flex flex-col justify-center overflow-hidden items-stretch gap-8 px-4 mb-8 lg:w-[85%] xl:w-[80%] 2k:w-[70%] lg:mx-auto lg:flex-row lg:items-end lg:justify-between lg:gap-0 lg:px-0 lg:mb-12 lg:overflow-visible lg:bg-transparent lg:relative",
  toggleContainer: "mb-12 md:mb-10 px-4 md:px-0",
  toggleWrapper:
    "flex bg-white/5 backdrop-blur-sm rounded-full p-1 border border-white/10 relative shadow-lg shadow-black/20 w-full sm:w-auto ipad:w-full",
  loadingContainer:
    "relative w-full h-screen bg-pixela-dark flex flex-col justify-center",
  loadingCard:
    "w-[280px] md:w-[375px] h-[395px] md:h-[528px] bg-gray-800 flex items-center justify-center",
  loadingText: "text-pixela-light",
} as const;

const BUTTON_OPTIONS = [
  { id: "series", label: "Series" },
  { id: "movies", label: "Películas" },
] as const;

/**
 * Componente que renderiza el título principal de la sección de tendencias
 * @returns {JSX.Element} Título estilizado
 */
const TrendingTitle = memo(() => (
  <h2 className={STYLES.title}>
    <span className={STYLES.titleMobile}>
      TEN-
      <br />
      DENCIAS
    </span>
    <span className={STYLES.titleDesktop}>TENDENCIAS</span>
  </h2>
));

TrendingTitle.displayName = "TrendingTitle";

/**
 * Componente que renderiza los botones de alternancia entre series y películas
 * @param {TrendingToggleProps} props - Props del componente
 * @returns {JSX.Element} Botones de alternancia
 */
const TrendingToggle = memo(
  ({ activeButton, onButtonChange }: TrendingToggleProps) => (
    <div className={STYLES.toggleContainer}>
      <div className={STYLES.toggleWrapper}>
        {BUTTON_OPTIONS.map(({ id, label }) => (
          <TrendingButton
            key={id}
            isActive={activeButton === id}
            onClick={() => onButtonChange(id)}
          >
            {label}
          </TrendingButton>
        ))}
      </div>
    </div>
  ),
);

TrendingToggle.displayName = "TrendingToggle";

/**
 * Componente que muestra el estado de carga de la sección de tendencias
 * @returns {JSX.Element} Estado de carga
 */
const LoadingState = memo(() => (
  <div className={STYLES.loadingContainer}>
    <div className={clsx(STYLES.contentWrapper, "mb-4")}>
      <TrendingTitle />
    </div>
    <div className="flex justify-center">
      <div className={STYLES.loadingCard}>
        <p className={STYLES.loadingText}>Cargando...</p>
      </div>
    </div>
  </div>
));

LoadingState.displayName = "LoadingState";

/**
 * Props para el componente ContentState
 * @property {MediaType} activeButton - El tipo de medio actualmente seleccionado
 * @property {TrendingSerie[] | TrendingMovie[]} activeContent - Contenido actual a mostrar
 * @property {(type: MediaType) => void} onButtonChange - Función para cambiar el tipo de medio
 * @property {object} quote - La cita actual a mostrar
 */
interface ContentStateProps {
  activeButton: MediaType;
  activeContent: TrendingSerie[] | TrendingMovie[];
  onButtonChange: (type: MediaType) => void;
  quote: {
    quote: string;
    author: string;
  };
}

/**
 * Componente que renderiza el contenido principal de la sección de tendencias
 * @param {ContentStateProps} props - Props del componente
 * @returns {JSX.Element} Contenido principal
 */
const ContentState = memo(
  ({
    activeButton,
    activeContent,
    onButtonChange,
    quote,
  }: ContentStateProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const toggleRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const quoteRef = useRef<HTMLDivElement>(null);

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

    return (
      <div id="tendencias" className={STYLES.container} ref={containerRef}>
        <div className={STYLES.content}>
          <div className={STYLES.contentWrapperWithToggle}>
            <div ref={titleRef}>
              <TrendingTitle />
            </div>
            <div ref={toggleRef}>
              <TrendingToggle
                activeButton={activeButton}
                onButtonChange={onButtonChange}
              />
            </div>
          </div>

          <div ref={carouselRef}>
            <TrendingMediaCarousel
              content={activeContent}
              type={activeButton}
            />
          </div>

          <div ref={quoteRef}>
            <QuoteSection quote={quote} />
          </div>
        </div>
      </div>
    );
  },
);

ContentState.displayName = "ContentState";

/**
 * Componente principal que maneja la sección de tendencias
 * Gestiona el estado del tipo de medio seleccionado y renderiza el contenido correspondiente
 * @returns {JSX.Element} Sección de tendencias
 */
export const TrendingHeader = ({
  quote,
}: {
  quote: { quote: string; author: string };
}) => {
  const series = useTrendingStore((state) => state.series);
  const movies = useTrendingStore((state) => state.movies);
  const [activeButton, setActiveButton] = useState<MediaType>("series");

  const activeContent = activeButton === "series" ? series : movies;

  // Si no hay contenido, no renderizamos nada - el skeleton de nivel superior se encarga
  if (!activeContent || activeContent.length === 0) {
    return null;
  }

  return (
    <ContentState
      activeButton={activeButton}
      activeContent={activeContent}
      onButtonChange={setActiveButton}
      quote={quote}
    />
  );
};

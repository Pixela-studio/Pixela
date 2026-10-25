"use client";
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
import {
  HEADER_LAYOUT_STYLES,
  HEADER_TOGGLE_STYLES,
  HEADER_TYPOGRAPHY_STYLES,
} from "@/shared/styles/headerStyles";

// Mismo contenedor y escala que Top Cartelera y Finde en casa
// (`shared/styles/headerStyles`); Tendencias solo ocupa la pantalla entera.
const STYLES = {
  ...HEADER_TOGGLE_STYLES,
  title: `${HEADER_TYPOGRAPHY_STYLES.title} text-left`,
  subtitle: `${HEADER_LAYOUT_STYLES.subtitle}`,
  container: HEADER_LAYOUT_STYLES.containerFullScreen,
  content: HEADER_LAYOUT_STYLES.content,
  contentWrapper: "w-[90%] md:w-[85%] lg:w-[80%] 2k:w-[70%] mx-auto",
  contentWrapperWithToggle: HEADER_LAYOUT_STYLES.headerWrapper,
  loadingContainer:
    "relative w-full h-screen bg-pixela-dark flex flex-col justify-center",
  loadingCard:
    "w-[160px] sm:w-[190px] md:w-[210px] xl:w-[230px] aspect-[2/3] bg-pixela-surface animate-pulse",
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
  <div>
    <h2 className={STYLES.title}>Tendencias</h2>
    <p className={STYLES.subtitle}>Lo que más se está viendo esta semana.</p>
  </div>
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
      <div className={STYLES.container} ref={containerRef}>
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

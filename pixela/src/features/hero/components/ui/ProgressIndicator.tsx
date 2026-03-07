"use client";

import clsx from "clsx";
import { useHeroStore } from "@/features/hero/store/heroStore";
import { FiPlay, FiPause } from "react-icons/fi";
import { HeroImage } from "@/features/hero/types/content";

const STYLES = {
  progress: {
    container:
      "absolute bottom-6 sm:bottom-14 md:bottom-20 lg:bottom-28 2k:bottom-16 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-xl px-4 lg:px-0 [@media(max-height:500px)_and_(orientation:landscape)]:bottom-2",
    content: "flex flex-col items-center gap-3 sm:gap-3 md:gap-3 lg:gap-4",
    controls: "flex items-center justify-between w-full",
    counter:
      "text-pixela-light/70 text-xs sm:text-xs md:text-sm lg:text-sm font-medium",
  },
  bar: {
    container: "w-full h-1 bg-pixela-light/20 rounded-full overflow-hidden",
    fill: "h-full bg-pixela-accent",
  },
  dot: {
    base: "h-2 rounded-full transition-all duration-300",
    active: "bg-pixela-accent w-4 sm:w-4 md:w-5 lg:w-6",
    inactive: "bg-pixela-light/50 w-2 hover:bg-pixela-light/70",
  },
  playback: {
    button:
      "p-1 sm:p-1 md:p-1.5 lg:p-2 rounded-full bg-pixela-dark/40 backdrop-blur-sm text-pixela-light hover:text-pixela-accent hover:bg-pixela-dark/60 transition-all duration-300",
    icon: "h-3 w-3 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4",
  },
} as const;

/**
 * Componente que muestra un punto de control para una imagen específica
 */
const SlideDot = ({
  index,
  isActive,
  onClick,
}: {
  index: number;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={clsx(
      STYLES.dot.base,
      isActive ? STYLES.dot.active : STYLES.dot.inactive,
    )}
    aria-label={`Ir a imagen ${index + 1}`}
  />
);

/**
 * Componente que muestra la barra de progreso del carrusel
 */
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className={STYLES.bar.container}>
    <div className={STYLES.bar.fill} style={{ width: `${progress}%` }} />
  </div>
);

/**
 * Componente que muestra los controles de reproducción del carrusel
 */
const PlaybackControl = ({
  isPlaying,
  onToggle,
}: {
  isPlaying: boolean;
  onToggle: () => void;
}) => (
  <button
    onClick={onToggle}
    className={STYLES.playback.button}
    aria-label={isPlaying ? "Pausar" : "Reproducir"}
  >
    {isPlaying ? (
      <FiPause className={STYLES.playback.icon} />
    ) : (
      <FiPlay className={STYLES.playback.icon} />
    )}
  </button>
);

/**
 * Componente que muestra el indicador de progreso y controles del carrusel
 * Incluye barra de progreso, controles de reproducción y navegación por puntos
 */
export const ProgressIndicator = ({ images }: { images: HeroImage[] }) => {
  const {
    setIsPlaying,
    handleSlideChange,
    activeSlideIndex,
    isPlaying,
    progress,
  } = useHeroStore();

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={STYLES.progress.container}>
      <div className={STYLES.progress.content}>
        <ProgressBar progress={progress} />

        <div className={STYLES.progress.controls}>
          <PlaybackControl
            isPlaying={isPlaying}
            onToggle={() => setIsPlaying(!isPlaying)}
          />

          <div className="flex space-x-1 sm:space-x-1 md:space-x-1.5 lg:space-x-2">
            {images.map((_, index) => (
              <SlideDot
                key={index}
                index={index}
                isActive={index === activeSlideIndex}
                onClick={() => handleSlideChange(index)}
              />
            ))}
          </div>

          <div className={STYLES.progress.counter}>
            {activeSlideIndex + 1}/{images.length}
          </div>
        </div>
      </div>
    </div>
  );
};

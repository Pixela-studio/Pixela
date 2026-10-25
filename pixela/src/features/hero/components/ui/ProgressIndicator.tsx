"use client";

import clsx from "clsx";
import { useHeroStore } from "@/features/hero/store/heroStore";
import { FiPlay, FiPause } from "react-icons/fi";
import { HeroImage } from "@/features/hero/types/content";

const STYLES = {
  progress: {
    container:
      "absolute bottom-6 sm:bottom-10 lg:bottom-14 2k:bottom-12 inset-x-0 z-20 px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 ls:bottom-2",
    content: "flex flex-col gap-3 lg:gap-4 max-w-xl",
    controls: "flex items-center justify-between w-full",
    counter:
      "text-white/70 text-sm font-medium tabular-nums [font-stretch:112%]",
  },
  bar: {
    container: "w-full h-0.5 bg-white/15 overflow-hidden",
    fill: "h-full bg-white",
  },
  dot: {
    base: "h-2 rounded-full transition-[width,background-color] duration-300 ease-out-expo",
    active: "bg-white w-6",
    inactive: "bg-white/35 w-2 hover:bg-white/60",
  },
  playback: {
    button:
      "grid h-9 w-9 place-items-center rounded-full bg-white/[0.08] text-white hover:bg-white/[0.16] active:scale-[0.97] transition duration-200",
    icon: "h-4 w-4",
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

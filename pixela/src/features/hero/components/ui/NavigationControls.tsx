'use client';

import { useHeroStore } from "@/features/hero/store/heroStore";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import clsx from 'clsx';
import { NavigationControlsProps, NavigationButtonProps } from "@/features/hero/types/content";

const STYLES = {
  navigation: {
    button: {
      container: {
        base: "absolute top-[35%] md:top-[40%] lg:top-1/2 transform -translate-y-1/2 z-20",
        left: "left-2 sm:left-3 md:left-4 lg:left-4",
        right: "right-2 sm:right-3 md:right-4 lg:right-4"
      },
      base: "p-1 sm:p-1 md:p-1.5 lg:p-2 rounded-full bg-pixela-dark/40 backdrop-blur-sm text-pixela-light hover:text-pixela-accent hover:bg-pixela-dark/60 transition-all duration-300",
      icon: "h-6 w-6 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8"
    }
  }
} as const;

/**
 * Componente que renderiza un botón de navegación para el carrusel
 */
const NavigationButton = ({ direction, onClick }: NavigationButtonProps) => {
  const Icon = direction === 'prev' ? FiChevronLeft : FiChevronRight;
  const position = direction === 'prev' ? STYLES.navigation.button.container.left : STYLES.navigation.button.container.right;
  const label = direction === 'prev' ? 'Imagen anterior' : 'Imagen siguiente';

  return (
    <div className={clsx(STYLES.navigation.button.container.base, position)}>
      <button 
        onClick={onClick}
        className={STYLES.navigation.button.base}
        aria-label={label}
      >
        <Icon className={STYLES.navigation.button.icon} />
      </button>
    </div>
  );
};

/**
 * Componente que muestra los controles de navegación del carrusel
 * Permite navegar entre las imágenes usando botones de anterior/siguiente
 */
export const NavigationControls = ({ imagesLength }: NavigationControlsProps) => {
  const { prevImage, nextImage } = useHeroStore();

  return (
    <>
      <NavigationButton 
        direction="prev" 
        onClick={() => prevImage(imagesLength)} 
      />
      <NavigationButton 
        direction="next" 
        onClick={() => nextImage(imagesLength)} 
      />
    </>
  );
}; 
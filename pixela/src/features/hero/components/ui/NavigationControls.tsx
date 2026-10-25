'use client';

import { useHeroStore } from "@/features/hero/store/heroStore";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import clsx from 'clsx';
import { NavigationControlsProps, NavigationButtonProps } from "@/features/hero/types/content";

const STYLES = {
  navigation: {
    button: {
      container: {
        base: "absolute top-1/2 -translate-y-1/2 z-20 hidden md:block",
        left: "left-3 lg:left-5",
        right: "right-3 lg:right-5"
      },
      base: "grid h-12 w-12 place-items-center rounded-full bg-white/[0.08] text-white hover:bg-white/[0.16] active:scale-[0.97] transition duration-200",
      icon: "h-6 w-6"
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
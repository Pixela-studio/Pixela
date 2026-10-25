import { ReactNode } from 'react';
import clsx from 'clsx';

/**
 * Direcciones posibles para el botón de navegación del slider
 */
type SliderDirection = 'prev' | 'next';

/**
 * Props para el componente SliderNavButton
 */
interface SliderNavButtonProps {

  icon: ReactNode;

  onClick: () => void;

  direction: SliderDirection;
  ariaLabel: string;
  className?: string;
}

const STYLES = {
  base: 'absolute z-20 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center',
  // Círculo marfil translúcido, sin vidrio ni borde rosa: el rosa es de las acciones.
  background: 'bg-pixela-dark/80 text-white',
  transitions: 'transition-[background-color,transform] duration-200 ease-out-expo active:scale-[0.97]',
  hover: 'hover:bg-pixela-raised',
  focus: '',
  position: {
    prev: 'left-3 lg:left-5',
    next: 'right-3 lg:right-5',
  },
} as const;

/**
 * Botón de navegación para el slider
 * @param {ReactNode} icon - Icono del botón
 * @param {() => void} onClick - Función a ejecutar al hacer click
 * @param {SliderDirection} direction - Dirección del botón
 * @param {string} ariaLabel - Etiqueta para el botón
 * @param {string} className - Clases CSS adicionales
 */
export const SliderNavButton = ({
  icon,
  onClick,
  direction,
  ariaLabel,
  className = '',
}: SliderNavButtonProps) => {
  return (
    <button 
      className={clsx(
        STYLES.base,
        STYLES.background,
        STYLES.transitions,
        STYLES.hover,
        STYLES.focus,
        STYLES.position[direction],
        className
      )}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
}; 
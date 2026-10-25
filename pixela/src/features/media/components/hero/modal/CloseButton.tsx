"use client";

import { FaTimes } from 'react-icons/fa';

interface CloseButtonProps {
  onClick: () => void;
}

const STYLES = {
  button: "absolute -top-12 right-0 text-white hover:text-pixela-accent transition-colors duration-300",
  icon: "w-8 h-8"
} as const;

export const CloseButton = ({ onClick }: CloseButtonProps) => (
  <button 
    type="button"
    className={STYLES.button}
    onClick={onClick}
    aria-label="Cerrar"
  >
    <FaTimes className={STYLES.icon} aria-hidden="true" />
  </button>
); 
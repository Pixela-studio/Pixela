'use client';

import { IoIosArrowUp } from "react-icons/io";
import { ScrollTopButtonProps } from "@/features/footer/types/components";

const STYLES = {
  // Mismo rótulo que los botones secundarios: borde marfil, sin halo ni vidrio.
  button: "group fixed right-6 bottom-6 md:bottom-8 z-20 flex h-12 w-12 items-center justify-center rounded-sm border border-white/20 bg-pixela-dark/95 text-white transition-[opacity,transform,border-color] duration-300 ease-out-expo hover:border-white/45 active:scale-95",
  buttonVisible: "opacity-100 translate-y-0",
  buttonHidden: "opacity-0 translate-y-8 pointer-events-none",
  icon: "transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5",
  tooltip: "pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-sm bg-pixela-surface px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
} as const;

export const FooterScrollTopButton: React.FC<ScrollTopButtonProps> = ({ showScrollButton }) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleScrollToTop}
      className={`${STYLES.button} ${
        showScrollButton ? STYLES.buttonVisible : STYLES.buttonHidden
      }`}
      aria-label="Volver arriba"
    >
      {/* Tooltip */}
      <div className={STYLES.tooltip}>
        Volver arriba
      </div>
      
      {/* Icono */}
      <IoIosArrowUp className={STYLES.icon} size={20} />
    </button>
  );
};

export default FooterScrollTopButton; 
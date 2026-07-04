'use client';

import { IoIosArrowUp } from "react-icons/io";
import { ScrollTopButtonProps } from "@/features/footer/types/components";

const STYLES = {
  button: "fixed right-6 bottom-6 md:bottom-8 z-20 w-12 h-12 backdrop-blur-lg border border-[#EC1B69]/30 hover:border-[#EC1B69] text-white rounded-full shadow-xl shadow-black/25 hover:shadow-[#EC1B69]/20 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-[#EC1B69]/40 focus:ring-offset-2 focus:ring-offset-transparent overflow-hidden hover:scale-105 active:scale-95 flex items-center justify-center",
  buttonVisible: "opacity-100 translate-y-0 scale-100",
  buttonHidden: "opacity-0 translate-y-8 scale-90 pointer-events-none",
  
  // Gradiente de fondo sutil 
  gradient: "absolute inset-0 bg-gradient-to-br from-[#EC1B69]/0 via-[#EC1B69]/5 to-[#EC1B69]/10 opacity-0 group-hover:opacity-100 transition-all duration-400",
  
  // Efecto de brillo sutil
  glow: "absolute inset-0 rounded-full bg-gradient-to-r from-[#EC1B69] to-[#EC1B69] opacity-0 group-hover:opacity-20 blur-sm transition-all duration-400",
  
  // Icono
  icon: "relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5 drop-shadow-sm",
  
  // Tooltip minimalista
  tooltip: "absolute bottom-full right-1/2 transform translate-x-1/2 mb-2 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 pointer-events-none whitespace-nowrap"
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
      {/* Efecto de brillo de fondo */}
      <div className={STYLES.glow}></div>
      
      {/* Gradiente sutil */}
      <div className={STYLES.gradient}></div>
      
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
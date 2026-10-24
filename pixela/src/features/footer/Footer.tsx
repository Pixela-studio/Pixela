'use client';

import { useState, useEffect } from "react";
import { FooterContent } from './components/core/FooterContent';
import { FooterBackdrop } from './components/layout/FooterBackdrop';
import FooterScrollTopButton from "./components/ui/FooterScrollTopButton";

const STYLES = {
  footer: "relative w-full bg-pixela-dark overflow-hidden min-h-[420px] flex items-center justify-center"
} as const;

/**
 * Footer de Pixela: enlaces, contacto y el botón de volver arriba sobre un
 * fondo estático (ver `FooterBackdrop`).
 */
export default function Footer() {
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      window.requestAnimationFrame(() => {
        setShowScrollButton(window.scrollY > 300);
      });
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <footer className={STYLES.footer}>
      <FooterBackdrop />
      
      <FooterContent />
      
      <FooterScrollTopButton showScrollButton={showScrollButton} />
    </footer>
  );
}
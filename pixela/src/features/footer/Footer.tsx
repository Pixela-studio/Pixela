'use client';

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FooterContent } from './components/core/FooterContent';
import FooterScrollTopButton from "./components/ui/FooterScrollTopButton";

const STYLES = {
  footer: "relative w-full bg-pixela-dark overflow-hidden min-h-[420px] flex items-center justify-center"
} as const;

const DynamicFooterParticles = dynamic(
  () => import("./components/ui/FooterParticles").then(mod => mod.FooterParticles),
  { ssr: false } 
);

const DynamicFooterBackgroundEffects = dynamic(
  () => import("./components/layout/FooterBackgroundEffects").then(mod => mod.FooterBackgroundEffects),
  { ssr: false } 
);

const DynamicFooterAnimations = dynamic(
  () => import("./components/ui/FooterAnimations").then(mod => mod.FooterAnimations),
  { ssr: false } 
);

/**
 * Componente Footer optimizado para Pixela
 * Implementa patrones de rendimiento como useMemo, división en subcomponentes
 * y carga dinámica para elementos visuales no críticos
 */
export default function Footer() {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      window.requestAnimationFrame(() => {
        setShowScrollButton(window.scrollY > 300);
      });
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    const animationTimer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(animationTimer);
    };
  }, []);

  return (
    <footer className={STYLES.footer}>
      {isMounted && (
        <>
          <DynamicFooterBackgroundEffects isAnimated={isAnimated} />
          <DynamicFooterParticles />
          <DynamicFooterAnimations />
        </>
      )}
      
      <FooterContent />
      
      <FooterScrollTopButton showScrollButton={showScrollButton} />
    </footer>
  );
}
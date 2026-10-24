import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Configuración para un elemento animado
 */
export interface AnimatedElement {
  ref: React.RefObject<HTMLElement | null>;
  duration?: number;
  delay?: string;
  ease?: string;
  y?: number;
  stagger?: number;
}

/**
 * Configuración principal del hook de animación
 */
export interface ScrollAnimationConfig {
  trigger: React.RefObject<HTMLElement | null>;
  elements: AnimatedElement[];
  triggerStart?: string;
  toggleActions?: string;
  initialY?: number;
}

/**
 * Hook genérico para animaciones de scroll con GSAP
 * Permite animar múltiples elementos con configuración personalizada
 * 
 * @param config - Configuración de la animación
 * 
 */
export const useScrollAnimation = ({
  trigger,
  elements,
  triggerStart = 'top 85%',
  toggleActions = 'play none none none',
  initialY = 20,
}: ScrollAnimationConfig) => {
  useEffect(() => {
    const triggerElement = trigger.current;
    
    if (!triggerElement || !elements.length) return;

    // Filtrar elementos que existen
    const validElements = elements.filter(element => element.ref.current);
    
    if (!validElements.length) return;

    // Configurar estado inicial de todos los elementos
    const allRefs = validElements.map(element => element.ref.current);

    // Con movimiento reducido el contenido se muestra tal cual, sin entrada.
    if (prefersReducedMotion()) {
      gsap.set(allRefs, { clearProps: 'opacity,visibility,transform' });
      return;
    }

    gsap.set(allRefs, { autoAlpha: 0, y: initialY });

    // Crear timeline principal
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerElement,
        start: triggerStart,
        toggleActions,
      },
    });

    // Animar cada elemento según su configuración
    validElements.forEach((element, index) => {
      const elementRef = element.ref.current;
      if (!elementRef) return;

      const config = {
        autoAlpha: 1,
        y: element.y || 0,
        duration: element.duration || 0.6,
        ease: element.ease || 'power2.out',
        ...(element.stagger && { stagger: element.stagger })
      };

      if (element.stagger) {
        // Con stagger se animan los hijos: el contenedor se muestra ya (si no,
        // se quedaba en opacidad 0 para siempre) y son los hijos los que parten
        // ocultos.
        const children = gsap.utils.toArray<HTMLElement>(elementRef.children);
        gsap.set(elementRef, { autoAlpha: 1, y: 0 });
        gsap.set(children, { autoAlpha: 0, y: initialY });
        tl.to(children, config, element.delay || (index === 0 ? 0 : "-=0.3"));
      } else {
        // Animar el elemento directamente
        tl.to(elementRef, config, element.delay || (index === 0 ? 0 : "-=0.3"));
      }
    });

    return () => {
      tl.kill();
    };

  }, [trigger, elements, triggerStart, toggleActions, initialY]);
}; 
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Interfaz para las referencias a los elementos del DOM
 * 
 * @interface AnimationRefs
 * @property {React.RefObject<HTMLDivElement | null>} containerRef - Referencia al contenedor principal
 * @property {React.RefObject<HTMLDivElement | null>} leftSectionRef - Referencia a la sección izquierda
 * @property {React.RefObject<HTMLDivElement | null>} gridRef - Referencia al grid de tarjetas
 */
interface AnimationRefs {
    containerRef: React.RefObject<HTMLDivElement | null>;
    leftSectionRef: React.RefObject<HTMLDivElement | null>;
    gridRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook para animar la sección de descubrimiento
 * @param param0 Referencias a los elementos del DOM
 * @returns void
 */
export const useDiscoverAnimation = ({
    containerRef,
    leftSectionRef,
    gridRef,
}: AnimationRefs) => {
    useEffect(() => {
        const leftSection = leftSectionRef.current;
        const grid = gridRef.current;
        const container = containerRef.current;

        if (!leftSection || !grid || !container) return;
        if (prefersReducedMotion()) return;

        const leftElements = gsap.utils.toArray(leftSection.children);

        gsap.set(leftElements.concat(grid), { autoAlpha: 0 });
        gsap.set(leftElements, { y: 20 });
        gsap.set(grid, { x: 20 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: container,
                start: 'top 75%',
                toggleActions: 'play none none none',
            },
        });

        tl.to(leftElements, {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            stagger: 0.2,
        })
        .to(grid, {
            autoAlpha: 1,
            x: 0,
            duration: 1,
            ease: 'power3.out',
        }, '-=0.8');

        return () => {
            tl.kill();
        };
    }, [containerRef, leftSectionRef, gridRef]);
}; 
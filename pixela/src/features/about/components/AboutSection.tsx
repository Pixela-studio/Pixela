"use client";

import { useRef } from 'react';
import { ABOUT_POINTS } from '@/features/about/data/aboutData';
import { useScrollAnimation } from '@/hooks';

/*
 * "Quiénes somos" como una página de créditos: el título en Bodoni, una
 * frase que dice qué es Pixela y tres puntos en columnas. Antes eran tres
 * tarjetas con un icono arriba y un borde que seguía al ratón, la plantilla
 * de cualquier landing.
 */
const STYLES = {
  section: "relative bg-pixela-dark py-24 md:py-32 lg:py-40 2k:py-32 ls:py-10",
  container: "w-full px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24",

  header: "grid gap-8 lg:grid-cols-12 lg:gap-12 mb-16 md:mb-24",
  title: "title-card text-[52px] sm:text-7xl md:text-[88px] xl:text-[104px] lg:col-span-5",
  statement:
    "font-display text-2xl md:text-[34px] leading-[1.25] tracking-[-0.01em] text-white/90 lg:col-span-7 lg:pt-4 [text-wrap:balance]",

  points: "grid gap-10 md:grid-cols-3 md:gap-12 lg:gap-16",
  pointTitle: "text-lg md:text-xl font-semibold text-white mb-3",
  pointText: "text-base leading-relaxed text-gray-400 max-w-sm",
} as const;

const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const statementRef = useRef<HTMLParagraphElement>(null);
  const pointsRef = useRef<HTMLDListElement>(null);

  useScrollAnimation({
    trigger: sectionRef,
    elements: [
      { ref: titleRef, duration: 0.8 },
      { ref: statementRef, duration: 0.6, delay: "-=0.5" },
      { ref: pointsRef, duration: 0.6, delay: "-=0.3", stagger: 0.08 },
    ],
  });

  return (
    <section className={STYLES.section} ref={sectionRef}>
      <div className={STYLES.container}>
        <div className={STYLES.header}>
          <h2 className={STYLES.title} ref={titleRef}>
            Quiénes somos
          </h2>
          <p className={STYLES.statement} ref={statementRef}>
            Pixela es una cartelera para decidir qué ver esta noche: menos
            tiempo buscando y más tiempo viendo.
          </p>
        </div>

        <dl className={STYLES.points} ref={pointsRef}>
          {ABOUT_POINTS.map(({ title, description }) => (
            <div key={title}>
              <dt className={STYLES.pointTitle}>{title}</dt>
              <dd className={STYLES.pointText}>{description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default AboutSection;

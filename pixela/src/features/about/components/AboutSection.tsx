"use client";

import { useRef } from 'react';
import { FEATURE_CARDS } from '@/features/about/data/aboutData';
import type { FeatureCard as FeatureCardType } from '@/features/about/types/components';
import { useScrollAnimation, useInteractiveBorder } from '@/hooks';

/**
 * Estilos constantes para el componente AboutSection
 * @constant
 *
 */
const STYLES = {

  // Seccion general
  section: "relative z-0 py-36 2k:py-24 px-4 max-sm:px-2 bg-pixela-dark [@media(max-height:500px)_and_(orientation:landscape)]:py-8",
  container: "max-w-7xl 2k:max-w-6xl mx-auto max-sm:w-5/6 ipad:w-[90%] 2k:w-[70%]",

  // Titulos
  title: "text-6xl max-sm:text-[clamp(2.5rem,10vw,3rem)] font-black mb-8 text-pixela-accent font-outfit relative inline-block [text-wrap:balance] max-sm:leading-[0.95] [@media(max-height:500px)_and_(orientation:landscape)]:text-[48px] [@media(max-height:500px)_and_(orientation:landscape)]:mb-4",
  titleUnderline: "absolute -bottom-2 left-0 w-0 h-1 bg-pixela-accent group-hover:w-full transition-all duration-500",
  subtitle: "text-xl max-sm:text-base text-white/80 text-left ipad:text-left lg:text-center xl:text-center",

  // Cabecera de la seccion
  header: "text-left ipad:text-left lg:text-center xl:text-center mb-16 2k:mb-12",
  headerText: "space-y-4 2k:space-y-3 max-w-3xl max-sm:mx-0 ipad:mx-0 lg:mx-auto xl:mx-auto",

  // Tarjeta de característica
  featuresGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 mb-20 [&>*:nth-child(3)]:md:col-span-2 [&>*:nth-child(3)]:lg:col-span-1",
  card: "group relative rounded-2xl p-px cursor-pointer overflow-hidden transition-transform duration-300 hover:-translate-y-1",
  cardBorder: "absolute inset-0 rounded-2xl bg-[radial-gradient(250px_at_var(--mouse-x)_var(--mouse-y),_rgba(236,27,105,0.8),_transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300",
  cardContent: "relative z-10 h-full rounded-[15px] p-8 max-sm:p-4 ipad:p-6 flex flex-col bg-gradient-to-br from-[#181818]/95 to-[#1a1a1a]/95 shadow-2xl shadow-pixela-accent/5",
  cardIcon: "text-4xl text-pixela-accent ipad:text-3xl",
  cardIconContainer: "mb-6 [@media(max-height:500px)_and_(orientation:landscape)]:mb-3",
  cardTitle: "text-2xl font-semibold text-white mb-4 group-hover:text-pixela-accent transition-colors duration-300 flex items-center ipad:text-xl ipad:mb-3 mt-1 [@media(max-height:500px)_and_(orientation:landscape)]:text-xl [@media(max-height:500px)_and_(orientation:landscape)]:mb-2",
  cardTitleContainer: "flex items-center gap-3 mb-4 ipad:flex-col ipad:items-start ipad:gap-2",
  cardDescription: "text-white/70 leading-relaxed flex-grow ipad:text-sm ipad:leading-relaxed",
  comingSoon: "px-2 py-1 text-xs font-bold uppercase tracking-wider bg-pixela-accent/20 text-pixela-accent rounded-full border border-pixela-accent/30 ipad:px-1.5 ipad:py-0.5 ipad:text-[10px] ipad:self-start ",
} as const;

/**
 * Componente que renderiza una tarjeta de característica
 * @component
 * @param {FeatureCard} props - Propiedades de la tarjeta
 * @returns {JSX.Element} Tarjeta de característica
 */
const FeatureCard = ({ icon, title, description, isComingSoon }: FeatureCardType) => {
  const cardRef = useInteractiveBorder<HTMLDivElement>();

  return (
    <div ref={cardRef} className={STYLES.card}>
      <div className={STYLES.cardBorder} />
      <div className={STYLES.cardContent}>
        <div className={STYLES.cardIconContainer}>
          <div className={STYLES.cardIcon}>{icon}</div>
        </div>
        <div className={STYLES.cardTitleContainer}>
          <h3 className={STYLES.cardTitle}>{title}</h3>
          {isComingSoon && (
            <span className={STYLES.comingSoon}>Próximamente</span>
          )}
        </div>
        <p className={STYLES.cardDescription}>{description}</p>
      </div>
    </div>
  );
};

/**
 * Componente principal que renderiza la sección "Acerca de"
 * @component
 * @returns {JSX.Element} Sección "Acerca de"
 */
const AboutSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const featuresGridRef = useRef<HTMLDivElement>(null);

  useScrollAnimation({
    trigger: sectionRef,
    elements: [
      { ref: titleRef, duration: 0.8 },
      { ref: subtitleRef, duration: 0.6, delay: "-=0.4" },
      { ref: featuresGridRef, duration: 0.6, delay: "-=0.2" }
    ]
  });

  return (
    <section className={STYLES.section} ref={sectionRef}>
      <div className={STYLES.container}>
        {/* Título y Subtítulo */}
        <div className={STYLES.header}>
          {/*
            Era un <h1>. Es una sección más dentro de la portada —las de
            tendencias, cartelera, fin de semana y descubre usan <h2>—, así que
            introducía un segundo encabezado de nivel 1 en la misma página.
          */}
          <h2 className={STYLES.title} ref={titleRef}>
            Quiénes Somos
            <span className={STYLES.titleUnderline}></span>
          </h2>
          <div className={STYLES.headerText}>
            <p className={STYLES.subtitle} ref={subtitleRef}>
              Somos apasionados del cine y la televisión. Por eso creamos una plataforma única, donde quienes aman las historias pueden descubrir, compartir y celebrar lo que los hace soñar.
            </p>
          </div>
        </div>

        {/* Tarjetas */}
        <div className={STYLES.featuresGrid} ref={featuresGridRef}>
          {FEATURE_CARDS.map((card, index) => (
            <FeatureCard key={index} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

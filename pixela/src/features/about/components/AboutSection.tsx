"use client";

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { TEAM_MEMBERS, FEATURE_CARDS } from '@/features/about/data/aboutData';
import type { TeamMember, FeatureCard as FeatureCardType } from '@/features/about/types/components';
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
  title: "text-6xl max-sm:text-4xl font-black mb-8 text-pixela-accent font-outfit relative inline-block max-sm:text-[64px] max-sm:leading-[0.95] max-sm:break-words [@media(max-height:500px)_and_(orientation:landscape)]:text-[48px] [@media(max-height:500px)_and_(orientation:landscape)]:mb-4",
  titleUnderline: "absolute -bottom-2 left-0 w-0 h-1 bg-pixela-accent group-hover:w-full transition-all duration-500",
  titleMobile: "block sm:hidden text-left",
  titleDesktop: "hidden sm:block",
  subtitle: "text-xl max-sm:text-base text-white/80 text-left ipad:text-left lg:text-center xl:text-center",

  // Tarjeta de característica
  card: "group relative rounded-2xl p-px cursor-pointer animate-float overflow-hidden",
  cardBorder: "absolute inset-0 rounded-2xl bg-[radial-gradient(250px_at_var(--mouse-x)_var(--mouse-y),_rgba(236,27,105,0.8),_transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300",
  cardContent: "relative z-10 h-full rounded-[15px] p-8 max-sm:p-4 ipad:p-6 flex flex-col bg-gradient-to-br from-[#181818]/95 to-[#1a1a1a]/95 shadow-2xl shadow-pixela-accent/5",
  cardIcon: "text-4xl text-pixela-accent ipad:text-3xl",
  cardIconContainer: "mb-6 [@media(max-height:500px)_and_(orientation:landscape)]:mb-3",
  cardTitle: "text-2xl font-semibold text-white mb-4 group-hover:text-pixela-accent transition-colors duration-300 flex items-center ipad:text-xl ipad:mb-3 mt-1 [@media(max-height:500px)_and_(orientation:landscape)]:text-xl [@media(max-height:500px)_and_(orientation:landscape)]:mb-2",
  cardTitleContainer: "flex items-center gap-3 mb-4 ipad:flex-col ipad:items-start ipad:gap-2",
  cardDescription: "text-white/70 leading-relaxed flex-grow ipad:text-sm ipad:leading-relaxed",
  comingSoon: "px-2 py-1 text-xs font-bold uppercase tracking-wider bg-pixela-accent/20 text-pixela-accent rounded-full border border-pixela-accent/30 ipad:px-1.5 ipad:py-0.5 ipad:text-[10px] ipad:self-start ",
  
  // Seccion de equipo
  teamSection: "py-20 2k:py-16 ipad:py-12 [@media(max-height:500px)_and_(orientation:landscape)]:py-8",
  teamHeader: "text-left ipad:text-left lg:text-center xl:text-center mb-16 2k:mb-12",
  teamHeaderText: "space-y-4 2k:space-y-3 max-w-3xl max-sm:mx-0 ipad:mx-0 lg:mx-auto xl:mx-auto",
  teamGrid: "flex flex-col md:flex-row justify-between gap-8 md:gap-16 2k:gap-12 ipad:flex-col ipad:gap-8",
  teamTextColumn: "w-full md:w-1/2 pt-8 md:pt-16 ipad:w-full ipad:pt-0",
  teamCardsColumn: "w-full md:w-1/2 flex flex-col gap-8 ipad:w-full ipad:gap-6",
  teamTextContainer: "max-sm:mt-2 ipad:mt-6",
  teamDescription: "text-xl max-sm:text-base text-white/90 leading-relaxed mb-4 ipad:text-lg ipad:mb-3",
  teamCardsGrid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6 mb-20 [&>*:nth-child(3)]:md:col-span-2 [&>*:nth-child(3)]:lg:col-span-1",
  teamTitleMobileEquipo: "block sm:hidden",
  teamTitleDesktopEquipo: "hidden sm:block",

  // Tarjeta de miembro del equipo
  teamCard: "w-full group relative rounded-2xl p-px cursor-pointer animate-float-smooth overflow-hidden",
  teamCardBorder: "absolute inset-0 rounded-2xl bg-[radial-gradient(200px_at_var(--mouse-x)_var(--mouse-y),_rgba(236,27,105,0.8),_transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300",
  teamCardContentContainer: "relative z-10 h-full rounded-[15px] p-6 max-sm:p-4 ipad:p-5 bg-gradient-to-br from-[#181818]/95 to-[#1a1a1a]/95 shadow-2xl shadow-pixela-accent/5",
  teamImage: "relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-pixela-accent/30 group-hover:border-pixela-accent/50 transition-colors duration-300 ipad:w-28 ipad:h-28",
  teamCardContent: "flex flex-col max-sm:items-start max-sm:gap-4 sm:flex-row sm:items-center sm:gap-6 ipad:flex-row ipad:gap-4",
  teamCardImageContainer: "flex-shrink-0 max-sm:w-full max-sm:flex max-sm:justify-start sm:w-auto",
  teamCardInfo: "flex-grow max-sm:text-left max-sm:w-full sm:text-left sm:w-auto",
  teamCardHeader: "flex flex-row items-center justify-between gap-3 sm:flex-row sm:items-start sm:gap-3 mb-2 md:items-center md:justify-between md:gap-2",
  teamRole: "text-pixela-accent/80 text-sm mb-3 ipad:text-xs",
  teamInfoContainer: "space-y-1.5 mb-3",
  teamInfoLabel: "text-white/70 text-sm",
  teamInfoValue: "text-pixela-accent font-medium text-sm",
  teamQuote: "text-white/80 italic text-sm leading-relaxed ipad:text-xs ipad:leading-relaxed",
  teamInfoRow: "flex items-start gap-2",

  // Botones de redes sociales
  socialsContainer: "flex items-center gap-2",
  socialButton: "group/social p-2 rounded-full bg-pixela-accent/10 hover:bg-pixela-accent/20 transition-all duration-300 flex items-center justify-center -mt-1 sm:-mt-2 md:-mt-1.5 md:p-1.5",
  socialButtonMobile: "max-sm:ml-auto",
  socialIcon: "text-lg text-pixela-accent group-hover/social:scale-110 transition-transform duration-300 w-5 h-5 sm:w-5 sm:h-5 sm:text-lg",
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
 * Componente que renderiza una tarjeta de miembro del equipo
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {TeamMember} props.member - Datos del miembro del equipo
 * @returns {JSX.Element} Tarjeta de miembro del equipo
 */
const TeamMemberCard = ({ member }: { member: TeamMember }) => {
  const cardRef = useInteractiveBorder<HTMLDivElement>();
  
  return (
    <div ref={cardRef} className={STYLES.teamCard}>
      <div className={STYLES.teamCardBorder} />
      <div className={STYLES.teamCardContentContainer}>
        <div className={STYLES.teamCardContent}>
          <div className={STYLES.teamCardImageContainer}>
            <div className={STYLES.teamImage}>
              <Image
                src={member.image}
                alt={member.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className={STYLES.teamCardInfo}>
            <div className={STYLES.teamCardHeader}>
              <h3 className={STYLES.cardTitle}>{member.name}</h3>
              <div className={`${STYLES.socialsContainer} ${STYLES.socialButtonMobile}`}>
                <Link
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={STYLES.socialButton}
                >
                  <FaLinkedin className={STYLES.socialIcon} />
                </Link>
                {member.github && (
                  <Link
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={STYLES.socialButton}
                  >
                    <FaGithub className={STYLES.socialIcon} />
                  </Link>
                )}
              </div>
            </div>
            <p className={STYLES.teamRole}>{member.role}</p>
            <div className={STYLES.teamInfoContainer}>
              <div className={STYLES.teamInfoRow}>
                <span className={STYLES.teamInfoLabel}>Serie favorita:</span>
                <span className={STYLES.teamInfoValue}>{member.favoriteSeries}</span>
              </div>
              <div className={STYLES.teamInfoRow}>
                <span className={STYLES.teamInfoLabel}>Película favorita:</span>
                <span className={STYLES.teamInfoValue}>{member.favoriteMovie}</span>
              </div>
            </div>
            <p className={STYLES.teamQuote}>
              &ldquo;{member.quote}&rdquo;
            </p>
          </div>
        </div>
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
  const teamTitleRef = useRef<HTMLHeadingElement>(null);
  const teamTextRef = useRef<HTMLDivElement>(null);
  const teamCardsRef = useRef<HTMLDivElement>(null);

  // DEBUG: Configuración simple sin stagger
  useScrollAnimation({
    trigger: sectionRef,
    elements: [
      { ref: titleRef, duration: 0.8 },
      { ref: subtitleRef, duration: 0.6, delay: "-=0.4" },
      { ref: featuresGridRef, duration: 0.6, delay: "-=0.2" }
    ]
  });

  useScrollAnimation({
    trigger: teamTitleRef,
    elements: [
      { ref: teamTitleRef, duration: 0.8 },
      { ref: teamTextRef, duration: 0.6, delay: "-=0.4" },
      { ref: teamCardsRef, duration: 0.6, delay: "-=0.2" }
    ]
  });

  return (
    <section className={STYLES.section} ref={sectionRef}>
      <div className={STYLES.container}>
        {/* Título y Subtítulo */}
        <div className={STYLES.teamHeader}>
          <h1 className={STYLES.title} ref={titleRef}>
            <span className={STYLES.titleMobile}>QUIÉ-<br/>NES SOMOS</span>
            <span className={STYLES.titleDesktop}>Quiénes Somos</span>
            <span className={STYLES.titleUnderline}></span>
          </h1>
          <div className={STYLES.teamHeaderText}>
            <p className={STYLES.subtitle} ref={subtitleRef}>
              Somos apasionados del cine y la televisión. Por eso creamos una plataforma única, donde quienes aman las historias pueden descubrir, compartir y celebrar lo que los hace soñar.
            </p>
          </div>
        </div>

        {/* Tarjetas */}
        <div className={STYLES.teamCardsGrid} ref={featuresGridRef}>
          {FEATURE_CARDS.map((card, index) => (
            <FeatureCard key={index} {...card} />
          ))}
        </div>

        {/* Sección del Equipo */}
        <div className={STYLES.teamSection}>
          <div className={STYLES.teamGrid}>
            {/* Columna de texto */}
            <div className={STYLES.teamTextColumn}>
              <h2 className={STYLES.title} ref={teamTitleRef}>
                <span className={STYLES.teamTitleMobileEquipo}>NUES-<br/>TRO EQUIPO</span>
                <span className={STYLES.teamTitleDesktopEquipo}>Nuestro Equipo</span>
                <span className={STYLES.titleUnderline}></span>
              </h2>
              <div className={STYLES.teamTextContainer} ref={teamTextRef}>
                <p className={STYLES.teamDescription}>
                  En Pixela, unimos talento y pasión por el cine. Somos desarrolladores, diseñadores y cinéfilos comprometidos con una misión: crear una plataforma donde descubrir historias sea tan emocionante como vivirlas.
                  Cada día trabajamos para mejorar y ofrecer la mejor experiencia posible a nuestra comunidad.
                </p>
                <p className={STYLES.teamDescription}>
                  Nuestra dedicación y amor por el cine nos impulsa a mejorar constantemente y ofrecer lo mejor a nuestros usuarios.
                </p>
              </div>
            </div>

            {/* Columna de cards */}
            <div className={STYLES.teamCardsColumn} ref={teamCardsRef}>
              {TEAM_MEMBERS.map((member, index) => (
                <TeamMemberCard key={index} member={member} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 
'use client';

import { useRef } from 'react';
import Link from 'next/link';
import FooterSocialLinks from '../content/FooterSocialLinks';
import { DISCOVER_LINKS, LEGAL_LINKS } from '@/features/footer/constants/links';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const STYLES = {
  // Layout principal
  container: "relative z-10 w-full",
  mainContainer: "w-[83.33%] max-w-7xl 2k:max-w-6xl 2k:w-[70%] mx-auto transition-all duration-700 ipad:w-[90%]",
  gridMain: "grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-8 md:gap-y-16 2k:gap-y-12 py-8 md:py-16 2k:py-12 ipad:gap-x-8 ipad:gap-y-6 ipad:py-12 ipad:grid-cols-3",

  // Logo y descripción
  logoColumn: "flex flex-col space-y-4 md:space-y-6 md:col-span-4 ipad:space-y-4 ipad:col-span-1",
  logoContainer: "flex items-center",
  logoWrapper: "relative",
  logoText: "tracking-tight font-black font-outfit text-3xl md:text-5xl ipad:text-4xl",
  description: "text-white/80 text-sm md:text-base max-w-md lg:max-w-2xl xl:max-w-xl leading-relaxed mt-2 ipad:text-sm ipad:leading-relaxed ipad:max-w-full",

  // Información de contacto
  contactContainer: "flex flex-wrap gap-x-6 md:gap-x-8 gap-y-3 md:gap-y-4 mt-2 md:mt-3 ipad:gap-x-4 ipad:gap-y-2",
  contactGroup: "flex flex-col group",
  contactLabel: "text-white/50 text-xs uppercase tracking-widest group-hover:text-[#EC1B69]/80 transition-colors duration-300",
  contactLink: "text-white hover:text-[#EC1B69] transition flex items-center group",
  contactArrow: "ml-1 transform translate-x-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300",
  contactText: "text-white group-hover:text-[#EC1B69]/90 transition-colors duration-300",

  // Navegación y enlaces
  mobileSeparator: "h-px w-full bg-white/5 md:hidden my-4",
  linksContainer: "grid grid-cols-2 gap-25 md:contents ipad:contents",
  explorerColumn: "md:col-span-3 text-left ipad:col-span-1",
  companyColumn: "md:col-span-3 text-left ipad:col-span-1",
  sectionTitle: "text-white font-bold text-base md:text-lg mb-4 md:mb-6 relative inline-block ipad:text-base ipad:mb-4",
  titleUnderline: "absolute -bottom-1 left-0 w-8 h-0.5 bg-[#EC1B69]/50 rounded-full",
  linksList: "space-y-4 ipad:space-y-3",
  linkItem: "transform hover:translate-x-1 transition-transform duration-300",
  linkAnchor: "text-white/70 hover:text-[#EC1B69] transition flex items-center justify-start group ipad:text-sm",
  linkIndicator: "w-0 h-0.5 bg-[#EC1B69] mr-0 opacity-0 group-hover:w-2 group-hover:mr-2 group-hover:opacity-100 transition-all duration-300",

  // Redes sociales
  socialColumn: "flex flex-col space-y-6 md:space-y-8 md:col-span-2 mt-6 md:mt-0 ipad:space-y-5 ipad:mt-0 ipad:col-span-1",

  // Footer inferior
  copyrightSection: "pb-8 md:pb-12 transition-all duration-700 delay-100 ipad:pb-8",
  copyrightContainer: "flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 ipad:flex-col ipad:gap-3",
  copyrightText: "text-white/60 text-xs md:text-sm text-center sm:text-left ipad:text-xs ipad:text-center",
  copyrightLinks: "flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2 ipad:justify-center",
  copyrightLink: "text-white/60 hover:text-[#EC1B69] text-xs md:text-sm transition-colors ipad:text-xs",
  copyrightSeparator: "text-white/20 hidden sm:inline ipad:hidden",
} as const;

export const FooterContent = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const newsletterRef = useRef<HTMLDivElement>(null);
  const copyrightRef = useRef<HTMLDivElement>(null);

  // Aplicar animaciones del footer - configuración mejorada
  useScrollAnimation({
    trigger: containerRef,
    triggerStart: 'top 85%',
    initialY: 40,
    elements: [
      { ref: logoRef, duration: 0.8 },
      { ref: linksRef, duration: 0.6, delay: "-=0.6" },
      { ref: newsletterRef, duration: 0.6, delay: "-=0.4" },
      { ref: copyrightRef, duration: 0.5, delay: "-=0.3" }
    ]
  });

  return (
    <div className={STYLES.container} ref={containerRef}>
      <div className={STYLES.mainContainer}>
        {/* Grids principales */}
        <div className={STYLES.gridMain}>
          {/* Columna 1: Logo y descripción */}
          <div className={STYLES.logoColumn} ref={logoRef}>
            <div className={STYLES.logoContainer}>
              <span
                className={STYLES.logoText}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  background: "linear-gradient(to right, #EC1B69, #EC1B69)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                PIXELA
              </span>
            </div>
            <p className={STYLES.description}>
              Descubriendo historias que nos conectan. Pixela une a los amantes del cine y las series en una experiencia visual donde compartir, opinar y disfrutar del séptimo arte es parte del viaje.
            </p>
            <div className={STYLES.contactContainer}>
              <div className={STYLES.contactGroup}>
                <span className={STYLES.contactLabel}>Email</span>
                <Link href="mailto:pixel@pixela.io" className={STYLES.contactLink}>
                  pixel@pixela.io
                  <span className={STYLES.contactArrow}>→</span>
                </Link>
              </div>
              <div className={STYLES.contactGroup}>
                <span className={STYLES.contactLabel}>Ubicación</span>
                <span className={STYLES.contactText}>Málaga, España</span>
              </div>
            </div>
          </div>

          {/* Separador para móviles */}
          <div className={STYLES.mobileSeparator}></div>

          {/* Contenedor para Explorar y Compañía */}
          <div className={STYLES.linksContainer} ref={linksRef}>
            {/* Columna 2: Links de exploración */}
            <div className={STYLES.explorerColumn}>
              <h3 className={STYLES.sectionTitle}>
                <div className={STYLES.titleUnderline}></div>
                Explorar
              </h3>
              <ul className={STYLES.linksList}>
                {DISCOVER_LINKS.map((item, index) => (
                  <li key={index} className={STYLES.linkItem}>
                    <Link 
                      href={item.href}
                      className={STYLES.linkAnchor}
                    >
                      <span className={STYLES.linkIndicator}></span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 3: Links de compañía */}
            <div className={STYLES.companyColumn}>
              <h3 className={STYLES.sectionTitle}>
                <div className={STYLES.titleUnderline}></div>
                Compañía
              </h3>
              <ul className={STYLES.linksList}>
                {LEGAL_LINKS.map((item, index) => (
                  <li key={index} className={STYLES.linkItem}>
                    <Link 
                      href={item.href}
                      className={STYLES.linkAnchor}
                    >
                      <span className={STYLES.linkIndicator}></span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Separador para móviles */}
          <div className={STYLES.mobileSeparator}></div>

          {/* Columna 4: redes sociales */}
          <div className={STYLES.socialColumn} ref={newsletterRef}>
            <FooterSocialLinks />
          </div>
        </div>

        {/* Copyright */}
        <div className={STYLES.copyrightSection} ref={copyrightRef}>
          <div className={STYLES.copyrightContainer}>
            <p className={STYLES.copyrightText}>
              © 2025 Pixela.io. Todos los derechos reservados.
            </p>
            <div className={STYLES.copyrightLinks}>
              <Link href="/cookies" className={STYLES.copyrightLink}>Política de cookies</Link>
              <span className={STYLES.copyrightSeparator}>|</span>
              <Link href="/accesibilidad" className={STYLES.copyrightLink}>Accesibilidad</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterContent; 
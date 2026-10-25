'use client';

import { useRef } from 'react';
import Link from 'next/link';
import FooterSocialLinks from '../content/FooterSocialLinks';
import { DISCOVER_LINKS, ACCOUNT_LINKS } from '@/features/footer/constants/links';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const STYLES = {
  // Layout principal
  container: "relative z-10 w-full",
  mainContainer: "w-full px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24",
  gridMain: "grid grid-cols-1 md:grid-cols-12 gap-x-12 gap-y-10 pt-20 pb-12 md:pt-28 md:pb-16 ipad:gap-x-8 ipad:grid-cols-3",

  // Logo y descripción
  logoColumn: "flex flex-col space-y-4 md:space-y-6 md:col-span-4 ipad:space-y-4 ipad:col-span-1",
  logoContainer: "flex items-center",
  logoWrapper: "relative",
  logoText: "font-display italic font-bold tracking-[-0.02em] leading-none text-white text-4xl md:text-5xl",
  description: "text-gray-400 text-base max-w-md leading-relaxed mt-2",

  // Información de contacto
  contactContainer: "flex flex-wrap gap-x-6 md:gap-x-8 gap-y-3 md:gap-y-4 mt-2 md:mt-3 ipad:gap-x-4 ipad:gap-y-2",
  contactGroup: "flex flex-col group",
  contactLabel: "text-gray-400 text-sm",
  contactText: "text-white",

  // Navegación y enlaces
  linksContainer: "grid grid-cols-2 gap-25 md:contents ipad:contents",
  explorerColumn: "md:col-span-3 text-left ipad:col-span-1",
  companyColumn: "md:col-span-3 text-left ipad:col-span-1",
  sectionTitle: "text-white font-semibold text-base mb-5",
  linksList: "space-y-3",
  linkAnchor: "text-gray-400 hover:text-white transition-colors duration-200",

  // Redes sociales
  socialColumn: "flex flex-col space-y-6 md:space-y-8 md:col-span-2 mt-6 md:mt-0 ipad:space-y-5 ipad:mt-0 ipad:col-span-1",

  // Footer inferior
  copyrightSection: "pb-8 md:pb-10",
  copyrightContainer: "flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 ipad:flex-col ipad:gap-3",
  copyrightText: "text-gray-400 text-sm text-center sm:text-left",
  copyrightLinks: "flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2 ipad:justify-center",
  copyrightLink: "text-gray-400 hover:text-white text-sm underline-offset-4 hover:underline transition-colors",
  copyrightSeparator: "text-white/20 hidden sm:inline ipad:hidden",
} as const;

/** Se calcula al cargar el módulo, no en cada render: leer la fecha durante el
 *  render rompe la pureza que exige React 19. */
const CURRENT_YEAR = new Date().getFullYear();

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
              <span className={STYLES.logoText}>
                Pixela
              </span>
            </div>
            <p className={STYLES.description}>
              Descubriendo historias que nos conectan. Pixela une a los amantes del cine y las series en una experiencia visual donde compartir, opinar y disfrutar del séptimo arte es parte del viaje.
            </p>
            <div className={STYLES.contactContainer}>
              <div className={STYLES.contactGroup}>
                <span className={STYLES.contactLabel}>Ubicación</span>
                <span className={STYLES.contactText}>Málaga, España</span>
              </div>
            </div>
          </div>

          {/* Separador para móviles */}

          {/* Contenedor para Explorar y Compañía */}
          <div className={STYLES.linksContainer} ref={linksRef}>
            {/* Columna 2: Links de exploración */}
            <div className={STYLES.explorerColumn}>
              <h3 className={STYLES.sectionTitle}>
                Explorar
              </h3>
              <ul className={STYLES.linksList}>
                {DISCOVER_LINKS.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      className={STYLES.linkAnchor}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Columna 3: accesos de cuenta */}
            <div className={STYLES.companyColumn}>
              <h3 className={STYLES.sectionTitle}>
                Tu cuenta
              </h3>
              <ul className={STYLES.linksList}>
                {ACCOUNT_LINKS.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      className={STYLES.linkAnchor}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Separador para móviles */}

          {/* Columna 4: redes sociales */}
          <div className={STYLES.socialColumn} ref={newsletterRef}>
            <FooterSocialLinks />
          </div>
        </div>

        {/* Copyright */}
        <div className={STYLES.copyrightSection} ref={copyrightRef}>
          <div className={STYLES.copyrightContainer}>
            <p className={STYLES.copyrightText}>
              © {CURRENT_YEAR} Pixela.io. Todos los derechos reservados.
            </p>
            {/* Los enlaces a /cookies y /accesibilidad apuntaban a rutas que no
                existen. Hasta que haya páginas legales reales, mejor no
                prometer una que devuelve 404. */}
            <p className={STYLES.copyrightText}>
              Datos de películas y series por{' '}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className={STYLES.copyrightLink}
              >
                TMDB
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterContent; 
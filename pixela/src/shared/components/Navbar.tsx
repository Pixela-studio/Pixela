'use client';
// Imports
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MdLogout } from 'react-icons/md';
import { FiSearch, FiUser, FiX } from 'react-icons/fi';
import { RxHamburgerMenu } from 'react-icons/rx';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { mainNavLinks } from '@/links/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSectionNavigation } from '@/hooks/useSectionNavigation';
import { loginHrefForHere } from '@/lib/authRedirect';

/**
 * Returns whether the current pathname matches this nav link.
 *
 * Hash links (Tendencias / Descubre / Sobre Nosotros) all live on the
 * homepage, so they only ever count as active when we're actually on `/`.
 * Marking the specific anchor as "current" would need a scroll observer —
 * scoped out of this pass.
 */
const isNavLinkActive = (href: string, pathname: string): boolean => {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
};

const STYLES = {
  // Barra plana (DESIGN.md › Navigation): transparente sobre el hero y con el
  // negro de sala sólido al hacer scroll. Sin píldora flotante ni vidrio.
  // El fondo va en el <nav> (no en el contenedor) para cubrir también la
  // franja de la muesca, que se reserva con safe-area-inset-top.
  navBase: 'w-full fixed top-0 left-0 z-50 pt-[env(safe-area-inset-top,0px)] transition-colors duration-300 ease-out-expo',
  navDocked: 'bg-pixela-dark/95',

  containerBase: 'w-full mx-auto flex items-center px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 transition-[padding] duration-300 ease-out-expo',
  containerFloating: 'py-5 lg:py-7 bg-transparent',
  containerDocked: 'py-3 lg:py-4',

  logo: 'mr-auto lg:mr-12 rounded-md',
  logoText: 'font-display italic font-bold text-[28px] lg:text-[30px] leading-none tracking-[-0.02em] text-white',
  navLinks: 'hidden lg:flex flex-1',
  navLinksContainer: 'flex gap-7 xl:gap-9',
  // Inactivo atenuado a 65% para que el activo (magenta) destaque; hover
  // devuelve al 100% mientras el underline crece.
  navLink: 'whitespace-nowrap text-[15px] font-medium [font-stretch:112%] text-white/70 relative group py-1 transition-colors duration-200 hover:text-white',
  navLinkActive: 'text-white',
  // Se escala en vez de animar `width`: así no fuerza layout en cada frame.
  navLinkUnderline: 'absolute -bottom-0.5 left-0 w-full h-0.5 bg-pixela-accent origin-left scale-x-0 transition-transform duration-300 ease-out-expo group-hover:scale-x-100',
  navLinkUnderlineActive: 'scale-x-100',
  userSection: 'hidden lg:flex ml-auto items-center',
  userContainer: 'flex items-center gap-2',
  userName: 'text-pixela-light text-sm',
  button: 'text-pixela-light/80 hover:text-pixela-accent transition-colors duration-300 p-2 rounded-full hover:bg-pixela-dark/30',
  divider: 'mx-2 h-6 w-0.5 bg-pixela-light/20',
  searchLink: 'flex items-center gap-2 rounded-full p-2 text-[15px] font-medium [font-stretch:112%] text-pixela-light/80 transition-colors duration-300 hover:text-white lg:mr-4',

  // Estilos para el menú hamburguesa
  mobileMenuButton: 'lg:hidden text-pixela-light hover:text-pixela-accent p-2 transition-colors duration-300 mr-1 ml-auto',
  mobileMenu: 'fixed inset-0 bg-pixela-dark z-[100] flex flex-col justify-start overflow-y-auto p-6 sm:p-12 pt-24 pb-8 transform transition-transform duration-500 ease-out-expo',
  mobileMenuVisible: 'translate-y-0',
  mobileMenuHidden: '-translate-y-full',
  mobileCloseButton: 'absolute top-6 right-6 text-pixela-light hover:text-pixela-accent p-2 transition-transform hover:rotate-90 duration-300',
  mobileNavContainer: 'flex flex-col flex-1 w-full mt-4 sm:mt-8',
  mobileNavLink: 'group relative font-display text-5xl sm:text-6xl tracking-[-0.03em] text-pixela-light py-4 sm:py-5 flex items-center justify-between w-full overflow-hidden',
  mobileNavLinkText: 'relative z-10 transition-transform duration-300 group-hover:translate-x-4',
  mobileNavLinkArrow: 'relative z-10 opacity-0 -translate-x-4 text-pixela-accent transition-[opacity,transform] duration-300 ease-out-expo group-hover:opacity-100 group-hover:translate-x-0',
  mobileNavLinkHoverBg: 'absolute inset-0 bg-pixela-accent/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out',
  mobileUserSection: 'mt-auto pt-8 w-full',
  mobileUserContainer: 'flex flex-col gap-4 w-full',
  mobileActionButton: 'group relative flex w-full items-center justify-between rounded-sm px-6 py-4 bg-white/[0.08] hover:bg-white transition-colors duration-300 overflow-hidden',
  mobileActionText: 'font-semibold text-lg text-pixela-light group-hover:text-pixela-dark relative z-10 transition-colors duration-300',
  mobileActionIcon: 'w-6 h-6 text-pixela-light group-hover:text-pixela-dark relative z-10 transition-colors duration-300',
} as const;

/**
 * Componente de botón de acción para el menú móvil
 */
const MobileActionButton = ({ 
  onClick, 
  icon: Icon, 
  label, 
  userName = '' 
}: { 
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void, 
  icon: React.ElementType, 
  label: string, 
  userName?: string 
}) => (
  <button 
    onClick={onClick} 
    className={STYLES.mobileActionButton}
  >
    <span className={STYLES.mobileActionText}>
      {userName ? userName : label}
    </span>
    <Icon className={STYLES.mobileActionIcon} />
  </button>
);

/**
 * Componente de barra de navegación principal
 * @returns {JSX.Element} Componente de barra de navegación
 */
// En landing (donde vive el hero de altura viewport) el navbar arranca
// flotando y pasa a docked cuando el usuario baja ~el 85% del viewport.
// En cualquier otra ruta el navbar arranca ya en docked porque no hay
// hero por debajo que justifique la píldora flotante.
//
// Hysteresis: dockea a 82% pero solo undockea si vuelve por debajo del
// 78%. Sin el gap el estado parpadea cuando el usuario se para justo
// en el umbral.
const isLandingPath = (pathname: string): boolean => pathname === "/";
const DOCK_ON_VH = 0.82;
const DOCK_OFF_VH = 0.78;

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { logout, syncWithSession } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDocked, setIsDocked] = useState(() => !isLandingPath(pathname));
  const { navigateToSection, navigateToTop } = useSectionNavigation();

  // Sincronizar sesión de NextAuth con el store
  useEffect(() => {
    if (status !== 'loading') {
      syncWithSession(session);
    }
  }, [session, status, syncWithSession]);
  
  /*
   * Aquí había un `router.prefetch()` de '/', '/profile' y '/categories' al
   * montar el navbar. El navbar está en todas las páginas, así que eran tres
   * descargas de payload RSC en cada carga del sitio —tres Edge Requests y, con
   * las rutas dinámicas, tres invocaciones de función— para navegaciones que la
   * mayoría de visitas no llega a hacer. Y `/profile` es un área privada: para
   * un visitante anónimo el prefetch nunca servía de nada.
   *
   * Los `<Link>` llevan ahora `prefetch={false}`, que en App Router **no**
   * desactiva el prefetch: solo lo mueve del "entrar en viewport" al "pasar el
   * ratón / empezar a tocar". La navegación sigue siendo instantánea para quien
   * de verdad va a navegar, y no se paga por quien no.
   */

  // Sincroniza el estado docked con la ruta / scroll:
  // - Fuera del landing: siempre docked.
  // - En landing: docked una vez el scroll supera 82% del viewport,
  //   undockea al volver por debajo del 78% (gap para evitar parpadeo).
  useEffect(() => {
    if (!isLandingPath(pathname)) {
      setIsDocked(true);
      return;
    }

    const evaluate = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      setIsDocked((prev) => {
        if (!prev && y >= h * DOCK_ON_VH) return true;
        if (prev && y < h * DOCK_OFF_VH) return false;
        return prev;
      });
    };

    evaluate();
    window.addEventListener("scroll", evaluate, { passive: true });
    window.addEventListener("resize", evaluate);

    return () => {
      window.removeEventListener("scroll", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [pathname]);

  // Manejar overflow del body cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Memoizar el nombre del usuario para evitar re-renders innecesarios
  const userDisplayName = useMemo(() => {
    if (!user) return '';
    return user.name || user.email?.split('@')[0] || '';
  }, [user]);

  const handleProfile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isAuthenticated && user) {
      router.push('/profile');
      setMobileMenuOpen(false);
    } else {
      router.push(loginHrefForHere());
    }
  };

  // Se cierra sesión **antes** de navegar. La versión anterior navegaba primero
  // y lanzaba el logout "en segundo plano" apoyándose en una bandera
  // `forceLogout` en localStorage: si la petición fallaba, el usuario veía la
  // interfaz de invitado con la cookie de sesión todavía válida.
  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    await logout();

    router.push('/');
    router.refresh();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Si estamos en la página principal y el enlace es a la página principal (inicio)
    if (href === "/") {
      e.preventDefault();
      // Usar la función navigateToTop del hook
      navigateToTop(closeMobileMenu);
      return;
    }
    
    if (href.startsWith('/#')) {
      e.preventDefault();
      const sectionId = href.replace('/#', '');
      navigateToSection(sectionId, closeMobileMenu);
    } else {
      closeMobileMenu();
    }
  };

  return (
    <>
      <nav
        className={`${STYLES.navBase} ${isDocked ? STYLES.navDocked : ''}`}
        role="navigation"
      >
        <div
          className={`${STYLES.containerBase} ${isDocked ? STYLES.containerDocked : STYLES.containerFloating}`}
        >
          {/*
            El logo era un <h1>, así que cada página del sitio arrancaba con un
            encabezado de nivel 1 que dice "Pixela" y compite con el título real
            del contenido: en la ficha de una película el primer <h1> del
            documento no era el nombre de la película. Es un enlace al inicio,
            no un encabezado; el estilo se mantiene idéntico.
          */}
          <Link
            href="/"
            className={STYLES.logo}
            prefetch={false}
            aria-label="Pixela — ir al inicio"
          >
            <span className={STYLES.logoText}>Pixela</span>
          </Link>
          
          <div className={STYLES.navLinks}>
            <div className={STYLES.navLinksContainer}>
              {mainNavLinks.map((link) => {
                const active = isNavLinkActive(link.href, pathname);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${STYLES.navLink} ${active ? STYLES.navLinkActive : ""}`}
                    aria-label={link.label}
                    aria-current={active ? "page" : undefined}
                    onClick={(e) => handleNavClick(e, link.href)}
                    prefetch={false}
                  >
                    {link.label}
                    <span
                      className={`${STYLES.navLinkUnderline} ${active ? STYLES.navLinkUnderlineActive : ""}`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
          
          {/* Buscador global, en todas las pantallas: los cinco testers de la
              ronda 2 lo buscaron arriba y solo existía dentro de Categorías. */}
          <Link
            href="/buscar"
            prefetch={false}
            className={STYLES.searchLink}
            aria-label="Buscar películas, series y personas"
          >
            <FiSearch className="w-5 h-5" aria-hidden="true" />
            <span className="hidden xl:inline">Buscar</span>
          </Link>

          <div className={STYLES.userSection}>
            {isAuthenticated && user ? (
              <div className={STYLES.userContainer}>
                <span className={STYLES.userName}>{userDisplayName}</span>
                <div className={STYLES.divider} />
                <button 
                  onClick={handleProfile}
                  className={STYLES.button}
                  aria-label="Ver perfil"
                >
                  <FiUser className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleLogout}
                  className={STYLES.button}
                  aria-label="Cerrar sesión"
                  disabled={isLoading}
                >
                  <MdLogout className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleProfile}
                className={STYLES.button}
                aria-label="Iniciar sesión"
              >
                <FiUser className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <button 
            className={STYLES.mobileMenuButton} 
            onClick={toggleMobileMenu}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={mobileMenuOpen ? "true" : "false"}
            aria-controls="mobile-menu"
          >
            <RxHamburgerMenu className="w-6 h-6" />
          </button>
        </div>
      </nav>
      
      <div
        id="mobile-menu"
        className={`${STYLES.mobileMenu} ${mobileMenuOpen ? STYLES.mobileMenuVisible : STYLES.mobileMenuHidden}`}
        aria-hidden={!mobileMenuOpen ? "true" : "false"}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(!mobileMenuOpen ? { inert: true as any } : {})}
      >
        <button 
          className={STYLES.mobileCloseButton} 
          onClick={closeMobileMenu}
          aria-label="Cerrar menú"
        >
          <FiX className="w-10 h-10" />
        </button>

        {/* Enlaces de navegación para móvil */}
        <div className={STYLES.mobileNavContainer}>
          {mainNavLinks.map((link, index) => {
            const active = isNavLinkActive(link.href, pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${STYLES.mobileNavLink} ${active ? "text-pixela-accent" : ""} ${mobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
                style={{ transitionDelay: mobileMenuOpen ? `${100 + index * 100}ms` : "0ms" }}
                onClick={(e) => handleNavClick(e, link.href)}
                aria-current={active ? "page" : undefined}
                prefetch={false}
              >
                <div className={STYLES.mobileNavLinkHoverBg} />
                <span className={STYLES.mobileNavLinkText}>{link.label}</span>
                <span className={STYLES.mobileNavLinkArrow}>→</span>
              </Link>
            );
          })}
        </div>

        {/* Sección de usuario para móvil */}
        <div 
          className={`${STYLES.mobileUserSection} transition-[opacity,transform] duration-700 ease-out-expo delay-500 ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className={STYLES.mobileUserContainer}>
            {isAuthenticated && user && (
              <MobileActionButton
                onClick={handleProfile}
                icon={FiUser}
                label="Perfil"
                userName={userDisplayName}
              />
            )}
            {!isAuthenticated && (
              <MobileActionButton
                onClick={handleProfile}
                icon={FiUser}
                label="Iniciar sesión"
              />
            )}
            
            {isAuthenticated && !isLoading && (
              <MobileActionButton
                onClick={handleLogout}
                icon={MdLogout}
                label="Cerrar sesión"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

'use client';
// Imports
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { MdLogout } from 'react-icons/md';
import { FiUser, FiX } from 'react-icons/fi';
import { RxHamburgerMenu } from 'react-icons/rx';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { mainNavLinks } from '@/links/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSectionNavigation } from '@/hooks/useSectionNavigation';

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
  // Nav wrapper: cambia márgenes/padding cuando pasa a docked.
  navBase: 'w-full fixed top-0 left-0 z-50 transition-[margin,padding] duration-300 ease-out',
  navFloating: 'mt-5 px-4',
  navDocked: 'mt-0 px-0',

  // Contenedor visible: en floating es una "píldora" flotante centrada;
  // en docked ocupa 100% de ancho, rectangular y con más opacidad.
  // max-w-full (100%) en docked en vez de max-w-none — max-width: none no
  // interpola en CSS, así que la píldora crecía a saltos.
  containerBase: 'w-full mx-auto flex items-center backdrop-blur-md transition-[max-width,padding,border-radius,background-color,box-shadow] duration-300 ease-out',
  containerFloating: 'max-w-[83.333%] p-4 max-sm:px-3 max-sm:w-[calc(100%-2rem)] rounded-[36px] bg-dark-opacity',
  containerDocked: 'max-w-full py-3 px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 rounded-none bg-pixela-dark/90 border-b border-white/10 shadow-lg shadow-black/30',

  logo: 'mx-10 sm:mx-2 md:mx-6 lg:mx-10 transition-transform duration-300 hover:scale-[1.02] active:scale-100',
  logoText: 'text-3xl font-bold font-outfit text-pixela-accent',
  navLinks: 'hidden lg:flex flex-1 justify-center',
  navLinksContainer: 'flex space-x-8 lg:space-x-6 xl:space-x-8',
  // Inactivo atenuado a 65% para que el activo (magenta) destaque; hover
  // devuelve al 100% mientras el underline crece.
  navLink: 'font-pixela-outfit-sm text-pixela-light/65 relative group transition-colors duration-300 hover:text-pixela-light',
  navLinkActive: 'text-pixela-accent hover:text-pixela-accent',
  navLinkUnderline: 'absolute -bottom-1 left-0 w-0 h-0.5 bg-pixela-accent transition-all duration-300 group-hover:w-full',
  navLinkUnderlineActive: 'w-full',
  userSection: 'hidden lg:flex mx-10 lg:mx-4 xl:mx-10 items-center',
  userContainer: 'flex items-center gap-2',
  userName: 'text-pixela-light font-pixela-outfit-sm',
  button: 'text-pixela-light/80 hover:text-pixela-accent transition-colors duration-300 p-2 rounded-full hover:bg-pixela-dark/30',
  divider: 'mx-2 h-6 w-0.5 bg-pixela-light/20',

  // Estilos para el menú hamburguesa
  mobileMenuButton: 'lg:hidden text-pixela-light hover:text-pixela-accent p-2 transition-all duration-300 mr-1 ml-auto',
  mobileMenu: 'fixed inset-0 bg-pixela-dark z-[100] flex flex-col justify-start overflow-y-auto p-6 sm:p-12 pt-24 pb-8 transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
  mobileMenuVisible: 'translate-y-0',
  mobileMenuHidden: '-translate-y-full',
  mobileCloseButton: 'absolute top-6 right-6 text-pixela-light hover:text-pixela-accent p-2 transition-transform hover:rotate-90 duration-300',
  mobileNavContainer: 'flex flex-col flex-1 w-full mt-4 sm:mt-8',
  mobileNavLink: 'group relative font-outfit font-black text-5xl sm:text-6xl text-pixela-light py-5 sm:py-6 border-b border-white/10 flex items-center justify-between w-full overflow-hidden transition-all duration-500 ease-out',
  mobileNavLinkText: 'relative z-10 transition-transform duration-300 group-hover:translate-x-4',
  mobileNavLinkArrow: 'relative z-10 opacity-0 -translate-x-4 text-pixela-accent transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0',
  mobileNavLinkHoverBg: 'absolute inset-0 bg-pixela-accent/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500 ease-out',
  mobileUserSection: 'mt-auto pt-8 w-full',
  mobileUserContainer: 'flex flex-col gap-4 w-full',
  mobileActionButton: 'group relative flex w-full items-center justify-between px-6 py-5 border-2 border-pixela-light/20 hover:border-pixela-accent bg-transparent transition-all duration-300 overflow-hidden',
  mobileActionText: 'font-outfit font-bold text-xl text-pixela-light group-hover:text-pixela-dark relative z-10 transition-colors duration-300',
  mobileActionIcon: 'w-6 h-6 text-pixela-light group-hover:text-pixela-dark relative z-10 transition-colors duration-300',
  mobileActionHoverBg: 'absolute inset-0 bg-pixela-accent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out',
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
    <div className={STYLES.mobileActionHoverBg} />
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
  
  // Prefetch de rutas críticas al montar el componente
  useEffect(() => {
    router.prefetch('/');
    router.prefetch('/profile');
    router.prefetch('/categories');
  }, [router]);

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
      router.push('/login');
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
        className={`${STYLES.navBase} ${isDocked ? STYLES.navDocked : STYLES.navFloating}`}
        role="navigation"
      >
        <div
          className={`${STYLES.containerBase} ${isDocked ? STYLES.containerDocked : STYLES.containerFloating}`}
        >
          {/* Prefetch en el logo para navegación al inicio */}
          <Link href="/" className={STYLES.logo} prefetch={true}>
            <h1 className={STYLES.logoText}>Pixela</h1>
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
                    prefetch={true}
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
                prefetch={true}
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
          className={`${STYLES.mobileUserSection} transition-all duration-700 delay-500 ${mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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

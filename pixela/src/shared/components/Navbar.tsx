'use client';
// Imports
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdLogout } from 'react-icons/md';
import { FiUser, FiX } from 'react-icons/fi';
import { RxHamburgerMenu } from 'react-icons/rx';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { mainNavLinks } from '@/links/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSectionNavigation } from '@/hooks/useSectionNavigation';

const STYLES = {
  nav: 'w-full fixed top-0 left-0 z-50 mt-5 px-4',
  container: 'w-full max-w-[83.333%] mx-auto flex items-center p-4 max-sm:px-3 max-sm:w-[calc(100%-2rem)] bg-dark-opacity backdrop-blur-sm rounded-[36px]',
  logo: 'mx-10 sm:mx-2 md:mx-6 lg:mx-10',
  logoText: 'text-3xl font-bold font-outfit text-pixela-accent',
  navLinks: 'hidden lg:flex flex-1 justify-center', 
  navLinksContainer: 'flex space-x-8 lg:space-x-6 xl:space-x-8',
  navLink: 'font-pixela-outfit-sm text-pixela-light relative group',
  navLinkUnderline: 'absolute bottom-0 left-0 w-0 h-0.5 bg-pixela-accent transition-all duration-300 group-hover:w-full',
  userSection: 'hidden lg:flex mx-10 lg:mx-4 xl:mx-10 items-center',
  userContainer: 'flex items-center gap-2',
  userName: 'text-pixela-light font-pixela-outfit-sm',
  button: 'text-pixela-light/80 hover:text-pixela-accent transition-colors duration-300 p-2 rounded-full hover:bg-pixela-dark/30',
  divider: 'mx-2 h-6 w-0.5 bg-pixela-light/20',

  // Estilos para el menú hamburguesa
  mobileMenuButton: 'lg:hidden text-pixela-light hover:text-pixela-accent p-2 rounded-full shadow-lg transition-all duration-300 mr-3 ml-auto',
  mobileMenu: 'fixed inset-0 bg-pixela-dark/95 backdrop-blur-lg z-50 flex flex-col justify-start overflow-y-auto items-start p-6 sm:p-8 md:p-16 pt-24 sm:pt-28 transform transition-all duration-300',
  mobileMenuVisible: 'translate-y-0 opacity-100 pointer-events-auto',
  mobileMenuHidden: 'translate-y-full opacity-0 pointer-events-none',
  mobileCloseButton: 'absolute top-6 right-6 text-pixela-light hover:text-pixela-accent p-2',
  mobileNavContainer: 'flex flex-col items-start w-full space-y-2 sm:space-y-8 pl-2 sm:pl-6',
  mobileNavLink: 'font-outfit font-black text-5xl sm:text-4xl text-pixela-light hover:text-pixela-accent py-3 pl-4 sm:pl-8 transition-colors duration-300 text-left w-full',
  mobileWelcomeText: 'text-sm sm:text-base font-outfit text-pixela-light/60 pl-4 sm:pl-8 mb-1',
  mobileUserGreeting: 'flex flex-col items-start pl-4 sm:pl-8 mb-4',
  mobileHelloText: 'text-sm sm:text-base font-outfit text-pixela-light/70 mb-1',
  mobileUserName: 'text-2xl sm:text-3xl font-outfit font-bold text-pixela-accent bg-gradient-to-r from-pixela-accent to-pink-400 bg-clip-text text-transparent',
  mobileUserSection: 'mt-8 sm:mt-12 flex flex-col items-start w-full space-y-4 sm:space-y-6',
  mobileUserContainer: 'flex flex-col items-start gap-4 sm:gap-5 w-full pl-2 sm:pl-6',
  mobileActionButton: 'flex items-center justify-start gap-3 text-pixela-light hover:text-pixela-accent transition-colors duration-300 py-2 sm:py-3 pl-4 sm:pl-8 rounded-lg hover:bg-pixela-accent/5 w-full border border-pixela-accent/10 hover:border-pixela-accent/30',
  mobileActionText: 'text-lg sm:text-xl font-outfit',
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
    {userName ? (
      <>
        <span className={STYLES.mobileActionText}>{userName}</span>
        <span className="text-pixela-light/40">|</span>
        <Icon className="w-6 h-6" />
      </>
    ) : (
      <>
        <Icon className="w-6 h-6" />
        <span className={STYLES.mobileActionText}>{label}</span>
      </>
    )}
  </button>
);

/**
 * Componente de barra de navegación principal
 * @returns {JSX.Element} Componente de barra de navegación
 */
export const Navbar = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { logout, syncWithSession } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    // Marcar inmediatamente que estamos haciendo logout
    localStorage.setItem('forceLogout', 'true');
    setMobileMenuOpen(false);
    
    // Usar router.push optimizado para navegación
    router.push('/');
    
    // Limpiar forceLogout después de la navegación
    setTimeout(() => {
      localStorage.removeItem('forceLogout');
    }, 1000);
    
    // Hacer logout en background
    try {
      await logout();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error durante el logout:', error);
      }
      // No importa si falla, ya redirigimos
    }
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
      <nav className={STYLES.nav} role="navigation">
        <div className={STYLES.container}>
          {/* Prefetch en el logo para navegación al inicio */}
          <Link href="/" className={STYLES.logo} prefetch={true}>
            <h1 className={STYLES.logoText}>Pixela</h1>
          </Link>
          
          <div className={STYLES.navLinks}>
            <div className={STYLES.navLinksContainer}>
              {mainNavLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={STYLES.navLink}
                  aria-label={link.label}
                  onClick={(e) => handleNavClick(e, link.href)}
                  prefetch={true} // Prefetch para todos los links
                >
                  {link.label}
                  <span className={STYLES.navLinkUnderline} />
                </Link>
              ))}
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
            aria-label="Abrir menú"
          >
            <RxHamburgerMenu className="w-6 h-6" />
          </button>
        </div>
      </nav>
      
      <div className={`${STYLES.mobileMenu} ${mobileMenuOpen ? STYLES.mobileMenuVisible : STYLES.mobileMenuHidden}`}>
        <button 
          className={STYLES.mobileCloseButton} 
          onClick={closeMobileMenu}
          aria-label="Cerrar menú"
        >
          <FiX className="w-8 h-8" />
        </button>

        {/* Enlaces de navegación para móvil */}
        <div className={STYLES.mobileNavContainer}>
          {mainNavLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={STYLES.mobileNavLink}
              onClick={(e) => handleNavClick(e, link.href)}
              prefetch={true} // Prefetch también en móvil
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Sección de usuario para móvil */}
        <div className={STYLES.mobileUserSection}>
          <div className={STYLES.mobileUserContainer}>
            {isAuthenticated && user && (
              <>
                <MobileActionButton
                  onClick={handleProfile}
                  icon={FiUser}
                  label="Perfil"
                  userName={userDisplayName}
                />
              </>
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

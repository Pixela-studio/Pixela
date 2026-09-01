import { FooterLink } from '../types/links';

/**
 * Enlaces del pie de página.
 *
 * Todos los destinos de esta lista deben existir como ruta real. La versión
 * anterior enlazaba a `/terms`, `/privacy`, `/cookies`, `/contact`, `/reviews`,
 * `/favorites` y `/lists`: siete rutas que nunca se implementaron, así que cada
 * clic en la columna "Compañía" del footer terminaba en la página 404.
 */
export const DISCOVER_LINKS: FooterLink[] = [
  { name: 'Inicio', href: '/' },
  { name: 'Tendencias', href: '/#trending' },
  { name: 'Descubre', href: '/#discover' },
  { name: 'Categorías', href: '/categories' },
  { name: 'Sobre Nosotros', href: '/#about' }
];

/** Accesos de cuenta. `/profile` redirige a `/login` si no hay sesión. */
export const ACCOUNT_LINKS: FooterLink[] = [
  { name: 'Mi perfil', href: '/profile' },
  { name: 'Mi biblioteca', href: '/profile' },
  { name: 'Iniciar sesión', href: '/login' },
  { name: 'Crear cuenta', href: '/register' }
];

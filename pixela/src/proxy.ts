import { NextResponse, type NextRequest } from "next/server";

/**
 * Proxy de seguridad (antes `middleware.ts`; Next 16 renombró la convención).
 *
 * El proyecto no tenía nada aquí: ninguna respuesta llevaba cabeceras de
 * seguridad, así que la app era encuadrable en un iframe (clickjacking), no
 * declaraba política de referrer y confiaba en el sniffing de MIME del navegador.
 *
 * Nota sobre autorización: la comprobación de cookie de abajo es solo UX (evita
 * el parpadeo del 403 antes de que `useSession` resuelva). La autorización real
 * vive en cada route handler mediante `requireUser` / `requireAdmin`, porque una
 * cookie presente pero inválida seguiría pasando este filtro.
 */

/** Rutas que requieren sesión para renderizarse. */
const PROTECTED_PREFIXES = ["/profile"];

/** Cookies de sesión de Auth.js v5 (con y sin prefijo seguro). */
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

const CSP_DIRECTIVES = [
  "default-src 'self'",
  // Next.js inyecta bootstrap inline; sin nonce por app hace falta unsafe-inline.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://image.tmdb.org https://img.youtube.com https://placehold.co https://via.placeholder.com https://images.unsplash.com https://i.pravatar.cc https://picsum.photos",
  "font-src 'self' data:",
  "connect-src 'self' https://api.themoviedb.org",
  // Reproductor de trailers embebido.
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CSP_DIRECTIVES,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => Boolean(request.cookies.get(name)?.value));
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const response =
    needsAuth && !hasSessionCookie(request)
      ? NextResponse.redirect(
          new URL(`/login?callbackUrl=${encodeURIComponent(pathname + search)}`, request.url),
        )
      : NextResponse.next();

  for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(header, value);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Todas las rutas salvo assets estáticos y el endpoint de imágenes de Next,
     * que no se benefician de estas cabeceras y sí pagarían el coste del proxy.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf)$).*)",
  ],
};

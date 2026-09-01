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

/**
 * User-agents rechazados con 403 antes de tocar nada.
 *
 * `robots.txt` es una petición cortés y estos agentes no la atienden. Bloquear
 * aquí no evita la petición que ya llegó —eso solo lo haría un WAF por delante—
 * pero sí corta la cascada que venía detrás: por cada página rastreada se
 * ahorran el payload RSC, las llamadas a `/api` y las decenas de imágenes.
 *
 * La lista es deliberadamente corta y de agentes que se autoidentifican: nadie
 * que traiga visitas reales está aquí. Se compara en minúsculas por subcadena.
 */
const BLOCKED_USER_AGENTS = [
  // SEO / backlinks
  "ahrefsbot",
  "semrushbot",
  "mj12bot",
  "dotbot",
  "dataforseobot",
  "blexbot",
  "barkrowler",
  "serpstatbot",
  "zoominfobot",
  "seekportbot",
  "screaming frog",
  // Agregadores, archivadores y scrapers genéricos
  "ccbot",
  "imagesiftbot",
  "timpibot",
  "scrapy",
  "python-requests",
  "python-urllib",
  "go-http-client",
  "libwww-perl",
  "curl/",
  "wget/",
  // Buscadores fuera del mercado objetivo (es-ES)
  "bytespider",
  "petalbot",
  "sogou",
  "yisouspider",
  "megaindex",
  // Entrenamiento de modelos
  "gptbot",
  "chatgpt-user",
  "oai-searchbot",
  "claudebot",
  "claude-web",
  "anthropic-ai",
  "google-extended",
  "facebookbot",
  "meta-externalagent",
  "amazonbot",
  "diffbot",
  "cohere-ai",
  "omgilibot",
  "perplexitybot",
];

/**
 * Respuesta para un agente bloqueado.
 *
 * Cuerpo vacío y `Cache-Control` largo: si el bot vuelve a pedir lo mismo, la
 * CDN puede responder sin despertar la función.
 */
function blockedResponse(): NextResponse {
  return new NextResponse(null, {
    status: 403,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function isBlockedAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const normalized = userAgent.toLowerCase();
  return BLOCKED_USER_AGENTS.some((agent) => normalized.includes(agent));
}

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

/**
 * Cookie "pista" legible desde JavaScript que refleja si hay sesión.
 *
 * Auth.js guarda su token en una cookie `httpOnly`, que el navegador no puede
 * leer. Por eso `SessionProvider` no tenía más remedio que preguntar a
 * `/api/auth/session` al montar **en toda carga de página**, también para el
 * visitante anónimo que nunca va a iniciar sesión: una Edge Request y una
 * invocación de función por visita, para acabar respondiendo "no hay sesión".
 *
 * Esta cookie no es `httpOnly` a propósito: no contiene el token ni nada
 * sensible, solo un "1". Su único trabajo es que el cliente sepa si merece la
 * pena preguntar. No sirve como autorización —falsificarla solo consigue que el
 * navegador haga una petición que devolverá `null`—; la autorización real sigue
 * en `requireUser` / `requireAdmin` dentro de cada route handler.
 *
 * Se mantiene aquí y no en el flujo de login porque el proxy ya ve todas las
 * peticiones: si la sesión caduca o se cierra desde otra pestaña, la pista se
 * corrige sola en la siguiente navegación.
 */
const SESSION_HINT_COOKIE = "pixela.has-session";

function syncSessionHint(
  request: NextRequest,
  response: NextResponse,
  hasSession: boolean,
): void {
  const hintPresent = request.cookies.get(SESSION_HINT_COOKIE)?.value === "1";

  if (hasSession === hintPresent) return;

  if (hasSession) {
    response.cookies.set(SESSION_HINT_COOKIE, "1", {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      // Sin `maxAge`: cookie de sesión de navegador. Si caduca antes que el
      // token de Auth.js, la siguiente petición la vuelve a poner.
    });
  } else {
    response.cookies.delete(SESSION_HINT_COOKIE);
  }
}

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (isBlockedAgent(request.headers.get("user-agent"))) {
    return blockedResponse();
  }

  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  const hasSession = hasSessionCookie(request);

  const response =
    needsAuth && !hasSession
      ? NextResponse.redirect(
          new URL(`/login?callbackUrl=${encodeURIComponent(pathname + search)}`, request.url),
        )
      : NextResponse.next();

  syncSessionHint(request, response, hasSession);

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
     *
     * Se excluyen además los ficheros de metadatos (`robots.txt`,
     * `sitemap.xml`, `manifest.webmanifest`): Next los genera en build y los
     * sirve estáticos, así que hacerlos pasar por aquí solo añadía una
     * ejecución del proxy a cada visita de un rastreador.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf)$).*)",
  ],
};

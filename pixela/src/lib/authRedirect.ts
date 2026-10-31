/**
 * Volver a donde estabas después de iniciar sesión o registrarte.
 *
 * Los botones que piden cuenta (guardar, favorito, reseñar) mandaban a `/login`
 * a secas, y el registro terminaba siempre en la portada: el visitante que se
 * daba de alta para guardar una película perdía la película. Todo el recorrido
 * —botón, login, enlace a registro y fin del registro— pasa ahora el destino en
 * `?callbackUrl=`.
 */

/** Solo rutas internas: evita un open redirect vía `?callbackUrl=`. */
export function safeCallbackUrl(raw: string | null | undefined): string {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return "/";
  return raw;
}

function withCallback(path: "/login" | "/register", callbackUrl: string): string {
  const target = safeCallbackUrl(callbackUrl);
  return target === "/" ? path : `${path}?callbackUrl=${encodeURIComponent(target)}`;
}

export const loginHref = (callbackUrl: string) => withCallback("/login", callbackUrl);
export const registerHref = (callbackUrl: string) => withCallback("/register", callbackUrl);

/**
 * La ruta actual, con su query, para usarla como destino de vuelta.
 *
 * Se lee de `window.location` en el momento del clic en lugar de con
 * `useSearchParams`: ese hook obliga a envolver en `<Suspense>` cualquier
 * página estática que lo use, y los botones que lo necesitan viven en fichas ISR.
 */
export function currentPath(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}`;
}

/** Destino de login para el botón que se acaba de pulsar. */
export const loginHrefForHere = () => loginHref(currentPath());

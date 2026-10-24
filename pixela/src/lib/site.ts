/**
 * URL canónica del sitio.
 *
 * Vive aquí y no repetida en `layout.tsx`, `robots.ts` y `sitemap.ts` porque las
 * tres tienen que coincidir: si el `openGraph.url` dice una cosa y el sitemap
 * otra, se le está dando a Google dos identidades del mismo sitio.
 *
 * Historia de por qué esto importa: el valor que había era `https://pixela.io`,
 * un dominio que **no es del proyecto** —está aparcado y en venta en
 * Spaceship.com—. Con eso, el sitemap anunciaba a los buscadores las URLs de una
 * página de venta de dominios y las tarjetas de redes sociales apuntaban ahí.
 *
 * En producción hay que definir `NEXT_PUBLIC_SITE_URL` con el dominio real
 * (en Coolify, como build arg: se inlinea en build). El valor por defecto solo
 * sirve para desarrollo local, para no anunciar ningún dominio ajeno.
 */
const DEFAULT_SITE_URL = "http://localhost:3000";

/** Sin barra final: el resto del código concatena rutas que ya empiezan por `/`. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
).replace(/\/$/, "");

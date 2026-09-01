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
 * El valor por defecto es la URL real de producción del proyecto en Vercel.
 * Cuando haya dominio propio, basta definir `NEXT_PUBLIC_SITE_URL` en el panel
 * de Vercel (Settings → Environment Variables) y apuntarlo también en Domains;
 * no hace falta tocar código.
 */
const DEFAULT_SITE_URL = "https://pixela-seven.vercel.app";

/** Sin barra final: el resto del código concatena rutas que ya empiezan por `/`. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
).replace(/\/$/, "");

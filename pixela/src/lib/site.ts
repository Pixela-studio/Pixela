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

/**
 * Responsables del sitio y buzón de contacto.
 *
 * Los citan el aviso legal, la política de privacidad y el pie. El buzón
 * anterior, `pixel@pixela.io`, era de un dominio que no es del proyecto: nadie
 * recibía lo que se mandaba allí, así que los derechos de privacidad no tenían
 * dónde ejercerse.
 */
export const SITE_OWNERS = "Pablo Gil Díaz y Ruyi Xia Ye";
export const CONTACT_EMAIL = "pabloinfodesign95@gmail.com";
export const SITE_LOCATION = "Málaga, España";

/** Fecha de la última revisión de los textos legales, en formato ISO. */
export const LEGAL_UPDATED_AT = "2026-10-30";

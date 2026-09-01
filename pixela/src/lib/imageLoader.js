/**
 * Loader de imágenes de `next/image`.
 *
 * Motivo: cada imagen que pasa por el optimizador de Next (`/_next/image?...`)
 * es una petición al edge de Vercel **y** una invocación del optimizador. La
 * portada renderiza del orden de 60-75 pósters y backdrops, así que una sola
 * visita generaba decenas de Edge Requests solo en imágenes.
 *
 * Todas esas imágenes vienen ya de `image.tmdb.org`, que es una CDN global y
 * expone las variantes por tamaño en la propia ruta (`/t/p/w780/...`). Volver a
 * optimizarlas en Vercel no aporta nada: se paga cuota por reempaquetar algo
 * que ya venía optimizado desde otra CDN.
 *
 * Este loader deja las URLs de TMDB apuntando directamente a su CDN (0
 * peticiones a Vercel) y mantiene el optimizador nativo para las pocas imágenes
 * locales del proyecto, replicando exactamente la URL que generaba el loader
 * por defecto.
 */

const TMDB_PREFIX = "https://image.tmdb.org/t/p/";

/**
 * Umbral por encima del cual merece la pena servir `original`.
 * Por debajo se usa `w780`, el único ancho intermedio que TMDB acepta tanto
 * para pósters como para backdrops (así no hay que adivinar el tipo de imagen).
 */
const ORIGINAL_MIN_WIDTH = 900;

/** Tamaños que se pueden reducir sin salir del catálogo válido de TMDB. */
const DOWNGRADABLE_SIZES = new Set(["original", "w1280"]);

export default function pixelaImageLoader({ src, width, quality }) {
  if (src.startsWith(TMDB_PREFIX)) {
    const rest = src.slice(TMDB_PREFIX.length);
    const separator = rest.indexOf("/");

    if (separator > 0) {
      const size = rest.slice(0, separator);
      const filePath = rest.slice(separator + 1);

      // Un backdrop `original` pesa varios MB y en móvil no se aprecia:
      // se baja a w780 cuando el hueco de layout no da para más.
      if (filePath && DOWNGRADABLE_SIZES.has(size) && width < ORIGINAL_MIN_WIDTH) {
        return `${TMDB_PREFIX}w780/${filePath}`;
      }
    }

    // Cualquier otro tamaño ya lo eligió `tmdbImageHelpers` con criterio: se
    // respeta tal cual para no pedirle a TMDB una variante que no publica.
    return src;
  }

  // Imágenes locales (`/img`, `/about/img`): misma URL que el loader nativo.
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}

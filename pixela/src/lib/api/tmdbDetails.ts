import { fetchFromTmdb } from "@/lib/tmdb";
import { tmdbIdSchema } from "@/lib/api/schemas";

/** Tipo tal y como lo usa la app en las URLs. */
export type PixelaMediaType = "movies" | "series";

/** Tipo tal y como lo espera TMDB. */
export type TmdbMediaType = "movie" | "tv";

export const toTmdbType = (type: string): TmdbMediaType =>
  type === "series" || type === "tv" ? "tv" : "movie";

/**
 * Detalle completo de una ficha en TMDB.
 *
 * Existe para que la ruta `/api/{tipo}/[id]` y los Server Components de las
 * fichas pidan **exactamente** la misma URL. Eso importa por dos razones:
 *
 * 1. Las fichas ya no salen a la red pública para llamar a su propia API. Antes,
 *    `getPeliculaById` hacía `fetch("https://<dominio>/api/movies/123")`, y como
 *    `generateMetadata` y el propio render llaman a la misma función, cada vista
 *    de una ficha generaba **dos** Edge Requests extra más dos invocaciones de
 *    función, aparte de las dos llamadas a TMDB.
 *
 * 2. Al ser la misma URL con la misma configuración de caché, la Data Cache de
 *    Next deduplica `generateMetadata` y el render en una sola llamada a TMDB.
 */

/**
 * Todo lo que la ficha necesita en una sola petición. La calificación por
 * edades tiene nombre distinto en películas (`release_dates`) y series
 * (`content_ratings`); antes no se pedía ninguna de las dos.
 */
const DETAIL_APPEND: Record<TmdbMediaType, string> = {
  movie: "credits,videos,images,similar,watch/providers,release_dates",
  tv: "credits,videos,images,similar,watch/providers,content_ratings",
};

/**
 * Valida un id de TMDB antes de interpolarlo en la ruta.
 *
 * Next decodifica los parámetros de ruta, así que un `%2E%2E%2F` llegaba aquí
 * como `../` y el constructor `URL` lo normalizaba: sin esta validación el
 * proxy es un puente a endpoints arbitrarios de TMDB con nuestra API key.
 */
export function parseTmdbId(rawId: string): number | null {
  const parsed = tmdbIdSchema.safeParse(rawId);
  return parsed.success ? parsed.data : null;
}

export async function fetchTmdbDetail<T>(
  tmdbType: TmdbMediaType,
  id: number,
): Promise<T> {
  return fetchFromTmdb<T>(`/${tmdbType}/${id}`, {
    append_to_response: DETAIL_APPEND[tmdbType],
    include_image_language: "en,null,es",
    // Sin esto solo llegaban vídeos en castellano: casi nunca el tráiler en
    // VO, y en cine no anglosajón ni siquiera en español.
    include_video_language: "es,en,null",
  });
}

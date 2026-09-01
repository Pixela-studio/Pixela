import { TrendingSerie, TrendingMovie } from "@/features/discover/types/media";
import { fetchFromTmdb } from "@/lib/tmdb";

/**
 * Contenido de la sección "Descubrir".
 *
 * Igual que en tendencias, este módulo solo lo usa `app/page.tsx` (Server
 * Component) y antes iba por `fetch("https://<dominio>/api/{tipo}/discover")`:
 * el servidor saliendo a la red pública para pedirse a sí mismo. Se sustituye
 * por la llamada directa a TMDB, que además queda cacheada una hora.
 *
 * Los parámetros son los mismos que aplicaba `proxyDiscover`: página 1 y
 * `include_adult=false`. El `limit=7` que viajaba en la query nunca llegó a
 * TMDB —no está en su allowlist—, el recorte se hacía y se sigue haciendo aquí.
 */

const DISCOVER_LIMIT = 7;

interface TmdbListResponse<T> {
  results?: T[];
}

async function fetchDiscoveredContent<T>(
  tmdbType: "movie" | "tv",
): Promise<T[]> {
  try {
    const data = await fetchFromTmdb<TmdbListResponse<T>>(
      `/discover/${tmdbType}`,
      { page: 1, include_adult: false },
    );

    return (data.results ?? []).slice(0, DISCOVER_LIMIT);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`Error fetching discovered ${tmdbType}:`, error);
    }
    return [];
  }
}

/**
 * Obtiene las series descubiertas
 * @returns Lista de series descubiertas (máximo 7)
 */
export const getDiscoveredSeries = (): Promise<TrendingSerie[]> =>
  fetchDiscoveredContent<TrendingSerie>("tv");

/**
 * Obtiene las películas descubiertas
 * @returns Lista de películas descubiertas (máximo 7)
 */
export const getDiscoveredMovies = (): Promise<TrendingMovie[]> =>
  fetchDiscoveredContent<TrendingMovie>("movie");

import { TrendingSerie, TrendingMovie } from "@/features/trending/types";
import { FetchOptions } from "@/features/trending/types/api";
import { fetchFromTmdb } from "@/lib/tmdb";

/**
 * Tendencias de la semana.
 *
 * Este módulo lo consume únicamente `app/page.tsx`, que es un Server Component:
 * por eso puede hablar con TMDB directamente.
 *
 * Antes hacía `fetch("https://<dominio>/api/series/trending")`, es decir, el
 * servidor se pedía a sí mismo por HTTP público una ruta que a su vez llamaba a
 * TMDB. Cada render de la portada salía del servidor, volvía a entrar por el
 * edge de Vercel y despertaba otra función: dos Edge Requests y dos
 * invocaciones por sección, cuatro en total solo para tendencias y descubrir.
 * Y como iba con `cache: "no-store"`, se repetía en cada visita.
 *
 * Llamando a `fetchFromTmdb` se salta ese rodeo y además entra en la Data Cache
 * de Next (`revalidate: 3600`), así que varias visitas comparten la misma
 * respuesta.
 */

const DEFAULT_LIMIT = 20;
const DEFAULT_OFFSET = 0;

interface TmdbListResponse<T> {
  results?: T[];
}

/**
 * Nota sobre `limit`/`offset`: la ruta `/api/{tipo}/trending` los aceptaba en la
 * query pero nunca los aplicaba —devolvía siempre la página completa de TMDB—,
 * así que se mantiene ese mismo comportamiento para no alterar lo que se ve en
 * portada. `offset` se traduce a la paginación de TMDB, que es lo único que el
 * proveedor admite.
 */
async function fetchTrendingMedia<T>(
  tmdbType: "movie" | "tv",
  { offset = DEFAULT_OFFSET }: FetchOptions = {},
): Promise<T[]> {
  try {
    const page = Math.max(1, Math.floor(offset / DEFAULT_LIMIT) + 1);

    const data = await fetchFromTmdb<TmdbListResponse<T>>(
      `/trending/${tmdbType}/week`,
      { page },
    );

    return data.results ?? [];
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`Error fetching trending ${tmdbType}:`, error);
    }
    return [];
  }
}

/**
 * Obtiene las series en tendencia
 * @param limit Se conserva por compatibilidad con las llamadas existentes
 * @param offset Punto de inicio para la paginación
 * @returns Lista de series en tendencia
 */
export async function getTrendingSeries(
  limit = DEFAULT_LIMIT,
  offset = DEFAULT_OFFSET,
): Promise<TrendingSerie[]> {
  return fetchTrendingMedia<TrendingSerie>("tv", { limit, offset });
}

/**
 * Obtiene las películas en tendencia
 * @param limit Se conserva por compatibilidad con las llamadas existentes
 * @param offset Punto de inicio para la paginación
 * @returns Lista de películas en tendencia
 */
export async function getTrendingMovies(
  limit = DEFAULT_LIMIT,
  offset = DEFAULT_OFFSET,
): Promise<TrendingMovie[]> {
  return fetchTrendingMedia<TrendingMovie>("movie", { limit, offset });
}

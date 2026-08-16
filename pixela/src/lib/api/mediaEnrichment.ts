import { fetchFromTmdb } from "@/lib/tmdb";
import { logger } from "@/lib/logger";

/**
 * Enriquecido de filas propias (favoritos, biblioteca, reseñas) con metadatos
 * de TMDB.
 *
 * `/api/favorites/details` y `/api/library/details` implementaban esto por
 * separado con el mismo try/catch por item y el mismo objeto de fallback
 * copiado literalmente.
 */

export interface TmdbMediaDetails {
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

export interface MediaSummary {
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
}

const FALLBACK_SUMMARY: MediaSummary = {
  title: "Error al cargar detalles",
  poster_path: null,
  overview: "",
  release_date: "",
  vote_average: 0,
};

function toSummary(data: TmdbMediaDetails): MediaSummary {
  return {
    title: data.title || data.name || "Sin título",
    poster_path: data.poster_path,
    overview: data.overview,
    release_date: data.release_date || data.first_air_date || "",
    vote_average: data.vote_average,
  };
}

/**
 * Resuelve en paralelo los metadatos de una lista de items.
 *
 * Deduplica por `(itemType, tmdbId)`: si el mismo título aparece varias veces
 * en la lista se hace una única petición a TMDB en vez de una por fila.
 * Un fallo individual degrada a `FALLBACK_SUMMARY` sin romper la respuesta.
 */
export async function enrichWithTmdb<T extends { tmdbId: bigint; itemType: string }>(
  items: T[],
): Promise<Map<string, MediaSummary>> {
  const uniqueKeys = new Map<string, { tmdbType: string; tmdbId: bigint }>();

  for (const item of items) {
    const key = `${item.itemType}:${item.tmdbId}`;
    if (!uniqueKeys.has(key)) {
      uniqueKeys.set(key, {
        tmdbType: item.itemType === "movie" ? "movie" : "tv",
        tmdbId: item.tmdbId,
      });
    }
  }

  const entries = [...uniqueKeys.entries()];
  const results = await Promise.allSettled(
    entries.map(([, { tmdbType, tmdbId }]) =>
      fetchFromTmdb<TmdbMediaDetails>(`${tmdbType}/${tmdbId}`),
    ),
  );

  const summaries = new Map<string, MediaSummary>();

  entries.forEach(([key], index) => {
    const result = results[index];

    if (result.status === "fulfilled") {
      summaries.set(key, toSummary(result.value));
      return;
    }

    logger.error(`Failed to fetch TMDB details for ${key}`, result.reason);
    summaries.set(key, FALLBACK_SUMMARY);
  });

  return summaries;
}

/** Clave de búsqueda dentro del mapa devuelto por `enrichWithTmdb`. */
export const mediaKey = (itemType: string, tmdbId: bigint) =>
  `${itemType}:${tmdbId}`;

export { FALLBACK_SUMMARY };

import { Serie } from '@/features/media/types/content';
import { fetchTmdbDetail, parseTmdbId } from '@/lib/api/tmdbDetails';
import { mapSerieFromApi } from './mapper/mapSerie';
import type { ApiSerie, ApiActor } from './types';
import {
  countryNames,
  crewOf,
  languageName,
  mapRegionProviders,
  mapSimilar,
  mapVideos,
  seriesStatus,
  tvCertification,
  type RawCrewMember,
  type RawRegionProviders,
  type RawVideo,
} from '@/api/shared/tmdbDetailExtras';

interface SerieImage {
  file_path: string;
  width?: number;
  height?: number;
  aspect_ratio?: number;
  vote_average?: number;
  vote_count?: number;
  iso_639_1?: string | null;
}

interface ExtendedSerieResponse extends ApiSerie {
  original_name?: string;
  original_language?: string;
  origin_country?: string[];
  vote_count?: number;
  status?: string;
  episode_run_time?: number[];
  last_episode_to_air?: { runtime?: number | null } | null;
  next_episode_to_air?: {
    air_date?: string;
    season_number?: number;
    episode_number?: number;
  } | null;
  credits?: {
    cast: ApiActor[];
    crew?: RawCrewMember[];
  };
  videos?: {
    results: RawVideo[];
  };
  'watch/providers'?: {
    results: { ES?: RawRegionProviders };
  };
  content_ratings?: Parameters<typeof tvCertification>[0];
  similar?: { results?: Parameters<typeof mapSimilar>[0] };
  images?: {
    backdrops: SerieImage[];
    posters: SerieImage[];
  };
}

/**
 * Obtiene los datos de una serie
 * @param id - ID de la serie
 * @returns - Serie
 */
export async function getSerieById(id: string): Promise<Serie> {
  /*
   * Se llama a TMDB directamente en vez de a `/api/series/[id]`.
   *
   * Esta función la usan el render de la ficha y su `generateMetadata`, ambos en
   * el servidor. Cuando iba por la API interna, cada vista de una ficha salía a
   * la red pública para pedirse a sí misma **dos veces**: dos Edge Requests y
   * dos invocaciones de función que no hacían nada que no se pudiera hacer aquí.
   *
   * Al compartir `fetchTmdbDetail` con la route handler, la Data Cache de Next
   * reconoce la misma URL y sirve las dos llamadas con una sola salida a TMDB.
   */
  const tmdbId = parseTmdbId(id);

  if (tmdbId === null) {
    throw new Error('Series not found or invalid data');
  }

  const rawSerie = await fetchTmdbDetail<ExtendedSerieResponse>('tv', tmdbId);

  if (!rawSerie?.id) {
    throw new Error('Series not found or invalid data');
  }
  const actores = rawSerie.credits?.cast || [];
  const { proveedores, proveedoresUrl } = mapRegionProviders(
    rawSerie['watch/providers']?.results?.ES,
  );
  const tituloOriginal = rawSerie.original_name?.trim();
  const titulo = rawSerie.name?.trim();
  const next = rawSerie.next_episode_to_air;

  const serie = mapSerieFromApi({
    ...rawSerie,
    actores,
    imagenes: rawSerie.images || { backdrops: [], posters: [] }
  });

  return {
    ...serie,
    trailers: mapVideos(rawSerie.videos?.results, rawSerie.original_language),
    proveedores,
    proveedoresUrl,
    clasificacion: tvCertification(rawSerie.content_ratings),
    tituloOriginal: tituloOriginal && tituloOriginal !== titulo ? tituloOriginal : undefined,
    idiomaOriginal: languageName(rawSerie.original_language),
    paises: countryNames(rawSerie.origin_country ?? []),
    votos: rawSerie.vote_count,
    equipo: crewOf(rawSerie.credits?.crew),
    similares: mapSimilar(rawSerie.similar?.results, 'serie'),
    // `episode_run_time` llega vacío en muchas series recientes: se cae a la
    // duración del último episodio emitido.
    duracionEpisodio:
      rawSerie.episode_run_time?.find((minutes) => minutes > 0) ??
      rawSerie.last_episode_to_air?.runtime ??
      undefined,
    estado: seriesStatus(rawSerie.status),
    proximoEpisodio:
      next?.air_date && next.season_number && next.episode_number
        ? { fecha: next.air_date, temporada: next.season_number, episodio: next.episode_number }
        : undefined,
  };
}

import { Serie } from '@/features/media/types/content';
import { fetchTmdbDetail, parseTmdbId } from '@/lib/api/tmdbDetails';
import { mapSerieFromApi } from './mapper/mapSerie';
import type {
  Video, Provider, ApiSerie, ApiActor
} from './types';

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
  credits?: {
    cast: ApiActor[];
  };
  videos?: {
    results: Video[];
  };
  'watch/providers'?: {
    results: {
      ES?: {
        flatrate?: Provider[];
        rent?: Provider[];
        buy?: Provider[];
      };
    };
  };
  images?: {
    backdrops: SerieImage[];
    posters: SerieImage[];
  };
}

const deduplicateProviders = (providers: Provider[]): Provider[] => {
  const seen = new Set<number>();
  return providers.filter(provider => {
    if (seen.has(provider.provider_id)) {
      return false;
    }
    seen.add(provider.provider_id);
    return true;
  });
};

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
  const trailers = rawSerie.videos?.results || [];

  const providersData = rawSerie['watch/providers']?.results?.ES;
  const allProviders: Provider[] = providersData ? [
    ...(providersData.flatrate || []),
    ...(providersData.rent || []),
    ...(providersData.buy || [])
  ] : [];

  const proveedores = deduplicateProviders(allProviders);

  return mapSerieFromApi({
    ...rawSerie,
    actores,
    trailers,
    proveedores,
    imagenes: rawSerie.images || { backdrops: [], posters: [] }
  });
}

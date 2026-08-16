import { Serie } from '@/features/media/types/content';
import { API_ENDPOINTS } from '@/api/shared/apiEndpoints';
import { fetchWithErrorHandling } from '@/api/shared/apiHelpers';
import { mapSerieFromApi } from './mapper/mapSerie';
import type {
  Video, Provider, ApiSerie, ApiActor, ApiResponse
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
  const response = await fetchWithErrorHandling<ApiResponse<ExtendedSerieResponse>>(
    API_ENDPOINTS.SERIES.GET_BY_ID(id)
  );
  
  if (!response?.data?.id) {
    throw new Error('Series not found or invalid data');
  }

  const rawSerie = response.data;
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

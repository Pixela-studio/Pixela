import { Serie } from '@/features/media/types/content';
import { API_ENDPOINTS } from '@/api/shared/apiEndpoints';
import { fetchWithErrorHandling } from '@/api/shared/apiHelpers';
import { mapSerieFromApi } from './mapper/mapSerie';
import type {
  Video, Provider, ApiSerie, ApiActor,
  ApiResponse, ApiCastResponse, ApiVideosResponse, ApiProvidersResponse
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

/**
 * Obtiene los actores de una serie
 * @param id - ID de la serie
 * @returns - Actores
 */
export async function getSerieActores(id: string): Promise<ApiActor[]> {
  const data = await fetchWithErrorHandling<ApiCastResponse>(
    API_ENDPOINTS.SERIES.GET_CAST(id)
  );
  
  if (!data?.success || !data.data?.cast) return [];
  
  // Filtrar actores con datos válidos
  return data.data.cast.filter((actor: ApiActor) => 
    actor && 
    (actor.nombre || actor.name) && 
    (actor.foto || actor.profile_path)
  );
}

/**
 * Obtiene los videos/trailers de una serie
 * @param id - ID de la serie
 * @returns - Videos
 */
export async function getSerieVideos(id: string): Promise<Video[]> {
  const data = await fetchWithErrorHandling<ApiVideosResponse>(
    API_ENDPOINTS.SERIES.GET_VIDEOS(id)
  );
  return data?.success ? (data.data?.results || []) : [];
}

/**
 * Obtiene los proveedores de streaming de una serie
 * @param id - ID de la serie
 * @param region - Región para los proveedores
 * @returns - Proveedores
*/
export async function getSerieProveedores(id: string, region = 'ES'): Promise<Provider[]> {
  const data = await fetchWithErrorHandling<ApiProvidersResponse>(
    `${API_ENDPOINTS.SERIES.GET_WATCH_PROVIDERS(id)}?region=${region}`
  );
  
  if (!data?.success || !data.data?.results?.[region]) return [];
  
  const providers = data.data.results[region];
  const allProviders = [
    ...(providers.flatrate || []),
    ...(providers.rent || []),
    ...(providers.buy || [])
  ];
  
  return allProviders.filter((provider, index, self) =>
    index === self.findIndex(p => p.provider_id === provider.provider_id)
  );
}

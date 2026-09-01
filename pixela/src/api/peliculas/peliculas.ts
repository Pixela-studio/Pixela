import { Pelicula } from '@/features/media/types/content';
import { fetchTmdbDetail, parseTmdbId } from '@/lib/api/tmdbDetails';
import { mapPeliculaFromApi } from './mapper/mapPelicula'; 
import type {
  ApiImage, ApiProvider, ApiTrailer, ApiPelicula, ApiActor
} from './types';

interface CrewMember {
  id: number;
  name: string;
  profile_path: string | null;
  job: string;
}

interface Creator {
  id: number;
  nombre: string;
  foto?: string;
}

interface ExtendedPeliculaResponse extends ApiPelicula {
  credits?: {
    cast: ApiActor[];
    crew: CrewMember[];
  };
  videos?: {
    results: ApiTrailer[];
  };
  'watch/providers'?: {
    results: {
      ES?: {
        flatrate?: ApiProvider[];
        rent?: ApiProvider[];
        buy?: ApiProvider[];
      };
    };
  };
  images?: {
    backdrops: ApiImage[];
    posters: ApiImage[];
  };
}

const deduplicateProviders = (providers: ApiProvider[]): ApiProvider[] => {
  const seen = new Set<number>();
  return providers.filter(provider => {
    if (!provider.provider_id) return false;
    
    if (seen.has(provider.provider_id)) {
      return false;
    }
    seen.add(provider.provider_id);
    return true;
  });
};

const extractDirector = (crew: CrewMember[]): Creator | undefined => {
  const director = crew.find(member => member.job === 'Director');
  
  if (!director) return undefined;
  
  return {
    id: director.id,
    nombre: director.name,
    foto: director.profile_path || undefined
  };
};


/**
 * Obtiene la película por ID junto con datos adicionales
 * @param id ID de la película
 * @returns Objeto Pelicula completo
 */
export async function getPeliculaById(id: string): Promise<Pelicula> {
  /*
   * Se llama a TMDB directamente en vez de a `/api/peliculas/[id]`.
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
    throw new Error('Movie not found or invalid data');
  }

  const rawPelicula = await fetchTmdbDetail<ExtendedPeliculaResponse>('movie', tmdbId);

  if (!rawPelicula?.id) {
    throw new Error('Movie not found or invalid data');
  }
  const actores = rawPelicula.credits?.cast || [];
  const trailers = rawPelicula.videos?.results || [];
  
  const providersData = rawPelicula['watch/providers']?.results?.ES;
  const allProviders: ApiProvider[] = providersData ? [
    ...(providersData.flatrate || []),
    ...(providersData.rent || []),
    ...(providersData.buy || [])
  ] : [];
  
  const proveedores = deduplicateProviders(allProviders);
  
  const imagenes = {
    backdrops: rawPelicula.images?.backdrops || [],
    posters: rawPelicula.images?.posters || []
  };
  
  const creador = extractDirector(rawPelicula.credits?.crew || []);

  return mapPeliculaFromApi({
    ...rawPelicula,
    actores,
    trailers,
    proveedores,
    imagenes,
    creador
  });
}

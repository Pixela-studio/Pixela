import { Serie, WatchProvider } from '../../../features/media/types';
import { Wallpaper } from '@/features/media/types/gallery';
import { ApiActor, ApiCreator, ApiImageEntry, ApiProvider, ApiSerie, ApiTrailer } from '../types';
import { buildTmdbImageUrl, DEFAULT_IMAGE_SIZES } from '@/lib/constants/tmdb';

/**
 * Formatea la URL de la imagen
 * @param path
 * @returns 
 */
const formatImageUrl = (path: string): string =>
  path?.startsWith('/') ? buildTmdbImageUrl(path, DEFAULT_IMAGE_SIZES.BACKDROP) : path || '';

/**
 * Mapea un actor
 * @param actor
 * @returns 
 */
const mapActor = (actor: ApiActor) => ({
  id: actor.id?.toString() || '',
  nombre: actor.nombre || actor.name || '',
  foto: formatImageUrl(actor.foto || actor.profile_path || ''),
  personaje: actor.personaje || actor.character || '',
});

/**
 * Mapea un trailer
 * @param trailer
 * @returns 
 */
const mapTrailer = (trailer: ApiTrailer) => ({
  id: trailer.id?.toString() || trailer.key || '',
  nombre: trailer.nombre || trailer.name || '',
  key: trailer.key || '',
  site: trailer.site || 'YouTube',
  tipo: trailer.tipo || trailer.type || '',
});

/**
 * Mapea un proveedor de streaming
 * @param provider
 * @returns 
 */
const mapProvider = (provider: ApiProvider, tipo?: 'flatrate' | 'rent' | 'buy'): WatchProvider => ({
  id: provider.provider_id?.toString() || '',
  nombre: provider.provider_name || '',
  logo: formatImageUrl(provider.logo_path || ''),
  tipo: tipo
});

/**
 * Mapea un creador de serie
 * @param creator
 * @returns 
 */
const mapCreator = (creator: ApiCreator) => ({
  id: creator.id?.toString() || '',
  nombre: creator.name || creator.nombre || '',
  foto: formatImageUrl(creator.profile_path || ''),
});

/**
 * Normaliza una imagen de la API al tipo `Wallpaper`.
 *
 * El parámetro estaba tipado como `any`, lo que ocultaba que `ApiImageEntry`
 * declara `width`, `height`, `aspect_ratio` y los votos como opcionales
 * mientras que `Wallpaper` los exige. Cualquier consumidor que calculara
 * `width / height` obtenía NaN cuando TMDB omitía el campo.
 */
const mapImage = (image: ApiImageEntry): Wallpaper => ({
  file_path: formatImageUrl(image.file_path || ''),
  width: image.width ?? 0,
  height: image.height ?? 0,
  aspect_ratio: image.aspect_ratio ?? 0,
  vote_average: image.vote_average ?? 0,
  vote_count: image.vote_count ?? 0,
});

/**
 * Mapea los datos de la API a un objeto Serie
 * @param apiData 
 * @returns 
 */
export function mapSerieFromApi(apiData: ApiSerie): Serie {
  // Procesar actores si existen
  const actores = [];
  if (apiData.actores && Array.isArray(apiData.actores)) {
    actores.push(...apiData.actores.map(mapActor));
  } else if (apiData.credits?.cast && Array.isArray(apiData.credits.cast)) {
    actores.push(...apiData.credits.cast.map(mapActor));
  } else if (apiData.cast && Array.isArray(apiData.cast)) {
    actores.push(...apiData.cast.map(mapActor));
  }
  
  // Procesar trailers si existen
  const trailers = [];
  if (apiData.trailers && Array.isArray(apiData.trailers)) {
    trailers.push(...apiData.trailers.map(mapTrailer));
  } else if (apiData.videos?.results && Array.isArray(apiData.videos.results)) {
    trailers.push(...apiData.videos.results.map(mapTrailer));
  } else if (apiData.results && Array.isArray(apiData.results)) {
    trailers.push(...apiData.results.map(mapTrailer));
  }

  // Procesar proveedores de streaming si existen
  const proveedores: WatchProvider[] = [];
  if (apiData.proveedores && Array.isArray(apiData.proveedores)) {
    proveedores.push(...apiData.proveedores.map((p: ApiProvider) => mapProvider(p)));
  }

  // Procesar creadores si existen
  const creadores = [];
  if (apiData.creadores && Array.isArray(apiData.creadores)) {
    creadores.push(...apiData.creadores.map(mapCreator));
  } else if (apiData.created_by && Array.isArray(apiData.created_by)) {
    creadores.push(...apiData.created_by.map(mapCreator));
  }

  const generos = Array.isArray(apiData.generos)
    ? apiData.generos.map((g) => typeof g === 'string' ? g : g.nombre || g.name || '')
    : [];

  return {
    id: apiData.id.toString(),
    titulo: apiData.nombre || apiData.titulo || apiData.name || apiData.title || '',
    sinopsis: apiData.descripcion || apiData.sinopsis || apiData.overview || '',
    fecha: apiData.fecha_estreno || apiData.fecha || apiData.first_air_date || '',
    generos,
    poster: formatImageUrl(apiData.poster_path || apiData.poster || ''),
    backdrop: formatImageUrl(apiData.backdrop_path || apiData.backdrop || ''),
    puntuacion: apiData.vote_average || apiData.puntuacion || 0,
    tipo: 'serie',
    temporadas: apiData.temporadas || apiData.number_of_seasons || 0,
    episodios: apiData.episodios || apiData.number_of_episodes || 0,
    actores,
    trailers,
    proveedores: apiData.proveedores?.map((p) => mapProvider(p)) || proveedores,
    imagenes: {
      backdrops: apiData.imagenes?.backdrops?.map(mapImage) || [],
      posters: apiData.imagenes?.posters?.map(mapImage) || [],
    },
    creadores,
  };
}

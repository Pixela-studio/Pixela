import { Pelicula } from '@/features/media/types/content';
import { Actor } from '@/features/media/types/people';
import { Trailer } from '@/features/media/types/trailer';
import { ApiActor, ApiImage, ApiPelicula, ApiProvider, ApiTrailer } from '../types';
import { buildTmdbImageUrl, DEFAULT_IMAGE_SIZES } from '@/lib/constants/tmdb';

/**
 * Formatea la URL de la imagen
 * @param path
 * @returns 
 */
export const formatImageUrl = (path: string): string =>
  path?.startsWith('/') ? buildTmdbImageUrl(path, DEFAULT_IMAGE_SIZES.BACKDROP) : path || '';

/**
 * Mapea un actor
 * @param actor
 * @returns 
 */
const mapActor = (actor: ApiActor): Actor => ({
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
const mapTrailer = (trailer: ApiTrailer): Trailer => ({
  id: trailer.id?.toString() || '',
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
const mapProvider = (provider: ApiProvider) => ({
  id: provider.provider_id?.toString() || '',
  nombre: provider.provider_name || '',
  logo: formatImageUrl(provider.logo_path || ''),
});

/**
 * Mapea una imagen
 * @param image
 * @returns 
 */
const mapImage = (image: ApiImage): ApiImage => ({
  ...image,
  file_path: formatImageUrl(image.file_path || ''),
});

/**
 * Mapea los datos de la API a un objeto Pelicula
 * @param movieData 
 * @returns 
 */
export function mapPeliculaFromApi(movieData: ApiPelicula): Pelicula {
  if (!movieData || !movieData.id) {
    console.error('[ERROR] mapPeliculaFromApi - Datos de API incompletos:', movieData);
    throw new Error('Los datos recibidos de la API están incompletos o en un formato inesperado');
  }

  const duracion = parseInt(String(movieData.duracion || movieData.runtime));
  if (isNaN(duracion)) {
    throw new Error('La duración de la película es requerida y debe ser un número válido');
  }

  const titulo = movieData.nombre || movieData.titulo || movieData.title || '';
  const sinopsis = movieData.descripcion || movieData.sinopsis || movieData.overview || '';
  const fecha = movieData.fecha_estreno || movieData.fecha || movieData.release_date || '';
  const generos = movieData.generos 
    ? (Array.isArray(movieData.generos) 
        ? movieData.generos.map((g: string | { nombre?: string; name?: string }) => 
            typeof g === 'string' ? g : g.nombre || g.name || '')
        : [String(movieData.generos)])
    : [];
  const poster = formatImageUrl(movieData.poster_path || movieData.poster || '');
  const backdrop = formatImageUrl(movieData.backdrop_path || movieData.backdrop || '');
  const puntuacion = parseFloat(String(movieData.vote_average || movieData.puntuacion)) || 0;

  return {
    id: movieData.id.toString(),
    titulo,
    sinopsis,
    fecha,
    generos,
    poster,
    backdrop,
    puntuacion,
    tipo: 'pelicula',
    duracion,
    actores: movieData.actores?.map(mapActor) || [],
    trailers: movieData.trailers?.map(mapTrailer) || [],
    proveedores: movieData.proveedores?.map(mapProvider) || [],
    imagenes: {
      backdrops: movieData.imagenes?.backdrops?.map(mapImage) || [],
      posters: movieData.imagenes?.posters?.map(mapImage) || [],
    },
    creador: movieData.creador ? {
      id: Number(movieData.creador.id),
      nombre: movieData.creador.nombre || movieData.creador.name || '',
      foto: formatImageUrl(movieData.creador.foto || movieData.creador.profile_path || '')
    } : undefined
  };
} 
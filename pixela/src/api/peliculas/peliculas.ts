import { Pelicula } from '@/features/media/types/content';
import { fetchTmdbDetail, parseTmdbId } from '@/lib/api/tmdbDetails';
import { mapPeliculaFromApi } from './mapper/mapPelicula'; 
import type { ApiImage, ApiPelicula, ApiActor } from './types';
import {
  countryNames,
  crewOf,
  directorsOf,
  languageName,
  mapRegionProviders,
  mapSimilar,
  mapVideos,
  movieCertification,
  type RawCrewMember,
  type RawRegionProviders,
  type RawVideo,
} from '@/api/shared/tmdbDetailExtras';

interface ExtendedPeliculaResponse extends ApiPelicula {
  original_title?: string;
  original_language?: string;
  production_countries?: Array<{ iso_3166_1?: string }>;
  vote_count?: number;
  credits?: {
    cast: ApiActor[];
    crew: RawCrewMember[];
  };
  videos?: {
    results: RawVideo[];
  };
  'watch/providers'?: {
    results: { ES?: RawRegionProviders };
  };
  release_dates?: Parameters<typeof movieCertification>[0];
  similar?: { results?: Parameters<typeof mapSimilar>[0] };
  images?: {
    backdrops: ApiImage[];
    posters: ApiImage[];
  };
}

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
  const crew = rawPelicula.credits?.crew;
  const directores = directorsOf(crew);
  const { proveedores, proveedoresUrl } = mapRegionProviders(
    rawPelicula['watch/providers']?.results?.ES,
  );
  const tituloOriginal = rawPelicula.original_title?.trim();
  const titulo = rawPelicula.title?.trim();

  const pelicula = mapPeliculaFromApi({
    ...rawPelicula,
    actores,
    imagenes: {
      backdrops: rawPelicula.images?.backdrops || [],
      posters: rawPelicula.images?.posters || [],
    },
    creador: directores[0]
      ? { id: Number(directores[0].id), nombre: directores[0].nombre, foto: directores[0].foto }
      : undefined,
  });

  return {
    ...pelicula,
    directores,
    trailers: mapVideos(rawPelicula.videos?.results, rawPelicula.original_language),
    proveedores,
    proveedoresUrl,
    clasificacion: movieCertification(rawPelicula.release_dates),
    tituloOriginal: tituloOriginal && tituloOriginal !== titulo ? tituloOriginal : undefined,
    idiomaOriginal: languageName(rawPelicula.original_language),
    paises: countryNames((rawPelicula.production_countries ?? []).map((c) => c.iso_3166_1)),
    votos: rawPelicula.vote_count,
    equipo: crewOf(crew),
    similares: mapSimilar(rawPelicula.similar?.results, 'pelicula'),
  };
}

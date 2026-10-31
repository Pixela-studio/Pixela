import { Media } from './mediaBase';
import { Creator } from './people';

export type { CrewCredit, SimilarTitle } from './mediaBase';

/**
 * Serie
 * @interface Serie
 * @property {number} temporadas - Número de temporadas
 * @property {number} episodios - Número de episodios
 * @property {Creator[]} creadores - Creadores de la serie
 * @property {string} poster_path - URL de la imagen de la serie
 * @property {string} name - Nombre de la serie
 * @property {string} title - Título de la serie
 * @property {number} vote_average - Puntuación de la serie
 * @property {string} first_air_date - Fecha de estreno de la serie
 * @property {string} overview - Resumen de la serie
 */
export interface Serie extends Media {
  temporadas: number;
  episodios: number;
  /** Minutos por episodio; TMDB la deja vacía en muchas series recientes. */
  duracionEpisodio?: number;
  /** «En emisión», «Finalizada», «Cancelada»… */
  estado?: string;
  proximoEpisodio?: { fecha: string; temporada: number; episodio: number };
  creadores?: Creator[];
  poster_path?: string;
  name?: string;
  title?: string;
  vote_average?: number;
  first_air_date?: string;
  overview?: string;
}

/**
 * Pelicula
 * @interface Pelicula
 * @property {number} duracion - Duración de la película
 * @property {string} poster_path - URL de la imagen de la película
 * @property {string} title - Título de la película
 * @property {number} vote_average - Puntuación de la película
 * @property {string} release_date - Fecha de estreno de la película
 * @property {string} overview - Resumen de la película
 */
export interface Pelicula extends Media {
  /**
   * Opcional: TMDB no la trae en muchos títulos antiguos o raros, y exigirla
   * convertía esas fichas en un 404.
   */
  duracion?: number;
  directores?: Creator[];
  poster_path?: string;
  title?: string;
  vote_average?: number;
  release_date?: string;
  overview?: string;
} 
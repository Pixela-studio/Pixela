/**
 * Video
 * @interface Video
 * @property {string} id - ID del video
 * @property {string} key - Clave del video
 * @property {string} name - Nombre del video
 * @property {string} site - Sitio web del video
 * @property {string} type - Tipo de video
 * @property {boolean} official - Si es oficial
 */
export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

/**
 * Provider
 * @interface Provider
 * @property {number} provider_id - ID del proveedor
 * @property {string} provider_name - Nombre del proveedor
 * @property {string} logo_path - URL de la imagen del proveedor
 * @property {number} display_priority - Prioridad de visualización
 */
export interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

/**
 * Actor
 * @interface ApiActor
 * @property {number} id - ID del actor
 * @property {string} nombre - Nombre del actor
 * @property {string} name - Nombre del actor
 * @property {string} foto - URL de la imagen del actor
 * @property {string} profile_path - URL de la imagen del actor
 * @property {string} personaje - Personaje del actor
 * @property {string} character - Personaje del actor
 */
export interface ApiActor {
  id?: number;
  nombre?: string;
  name?: string;
  foto?: string;
  profile_path?: string;
  personaje?: string;
  character?: string;
}

/**
 * Trailer
 * @interface ApiTrailer
 * @property {string} id - ID del trailer
 * @property {string} key - Clave del trailer
 * @property {string} nombre - Nombre del trailer
 * @property {string} name - Nombre del trailer
 * @property {string} site - Sitio web del trailer
 * @property {string} tipo - Tipo de trailer
 * @property {string} type - Tipo de trailer
 */
export interface ApiTrailer {
  id?: string;
  key?: string;
  nombre?: string;
  name?: string;
  site?: string;
  tipo?: string;
  type?: string;
}

/**
 * Provider
 * @interface ApiProvider
 * @property {number} provider_id - ID del proveedor
 * @property {string} provider_name - Nombre del proveedor
 * @property {string} logo_path - URL de la imagen del proveedor
 */
export interface ApiProvider {
  provider_id?: number;
  provider_name?: string;
  logo_path?: string;
}

/**
 * Creator
 * @interface ApiCreator
 * @property {number} id - ID del creador
 * @property {string} nombre - Nombre del creador
 * @property {string} name - Nombre del creador
 * @property {string} foto - URL de la imagen del creador
 * @property {string} profile_path - URL de la imagen del creador
 */
export interface ApiCreator {
  id?: number;
  nombre?: string;
  name?: string;
  foto?: string;
  profile_path?: string;
}

/**
 * Interfaz que representa una serie desde la API
 * @interface ApiSerie
 * @property {number} id - ID único de la serie
 * @property {string} [nombre] - Nombre de la serie en español
 * @property {string} [titulo] - Título de la serie en español
 * @property {string} [name] - Nombre de la serie en inglés
 * @property {string} [title] - Título de la serie en inglés
 * @property {string} [descripcion] - Descripción de la serie en español
 * @property {string} [sinopsis] - Sinopsis de la serie en español
 * @property {string} [overview] - Resumen de la serie en inglés
 * @property {string} [fecha_estreno] - Fecha de estreno en formato español
 * @property {string} [fecha] - Fecha alternativa en formato español
 * @property {string} [first_air_date] - Fecha de estreno en formato inglés
 * @property {Array<string | { nombre?: string; name?: string }>} [generos] - Lista de géneros de la serie
 * @property {string} [poster_path] - Ruta del póster en la API
 * @property {string} [poster] - URL alternativa del póster
 * @property {string} [backdrop_path] - Ruta de la imagen de fondo en la API
 * @property {string} [backdrop] - URL alternativa de la imagen de fondo
 * @property {number} [vote_average] - Puntuación promedio en formato decimal
 * @property {number} [puntuacion] - Puntuación alternativa
 * @property {number} [temporadas] - Número de temporadas en español
 * @property {number} [number_of_seasons] - Número de temporadas en inglés
 * @property {number} [episodios] - Número total de episodios en español
 * @property {number} [number_of_episodes] - Número total de episodios en inglés
 * @property {ApiActor[]} [actores] - Lista de actores principales
 * @property {ApiTrailer[]} [trailers] - Lista de trailers disponibles
 * @property {ApiProvider[]} [proveedores] - Lista de proveedores de streaming
 * @property {ApiCreator[]} [creadores] - Lista de creadores en español
 * @property {ApiCreator[]} [created_by] - Lista de creadores en inglés
 * @property {ApiActor[]} [cast] - Lista completa del elenco
 * @property {Object} [credits] - Objeto que contiene los créditos de la serie
 * @property {ApiActor[]} [credits.cast] - Lista completa del elenco
 * @property {Object} [videos] - Objeto que contiene los videos de la serie
 * @property {ApiTrailer[]} [videos.results] - Lista de videos/trailers
 * @property {ApiTrailer[]} [results] - Lista alternativa de videos/trailers
 */
export interface ApiSerie {
  id: number;
  nombre?: string;
  titulo?: string;
  name?: string;
  title?: string;
  descripcion?: string;
  sinopsis?: string;
  overview?: string;
  fecha_estreno?: string;
  fecha?: string;
  first_air_date?: string;
  generos?: Array<string | { nombre?: string; name?: string }>;
  poster_path?: string;
  poster?: string;
  backdrop_path?: string;
  backdrop?: string;
  vote_average?: number;
  puntuacion?: number;
  temporadas?: number;
  number_of_seasons?: number;
  episodios?: number;
  number_of_episodes?: number;
  actores?: ApiActor[];
  trailers?: ApiTrailer[];
  proveedores?: ApiProvider[];
  creadores?: ApiCreator[];
  created_by?: ApiCreator[];
  cast?: ApiActor[];
  credits?: {
    cast?: ApiActor[];
  };
  videos?: {
    results?: ApiTrailer[];
  };
  results?: ApiTrailer[];
  imagenes?: {
    backdrops: ApiImageEntry[];
    posters: ApiImageEntry[];
  };
}

export interface ApiImageEntry {
  file_path: string;
  width?: number;
  height?: number;
  aspect_ratio?: number;
  vote_average?: number;
  vote_count?: number;
  iso_639_1?: string | null;
} 

/** 
 * Interfaz que representa una respuesta de la API
 * @interface ApiResponse
 * @property {boolean} success - Si la respuesta fue exitosa
 * @property {T} data - Datos de la respuesta
 * @returns {ApiResponse<T>} - Respuesta de la API
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Interfaz que representa una respuesta de la API para el elenco
 * @interface ApiCastResponse
 * @property {boolean} success - Si la respuesta fue exitosa
 * @property {Object} data - Datos de la respuesta
 */
export interface ApiCastResponse {
  success: boolean;
  data: {
    cast: ApiActor[];
  };
}

/**
 * Interfaz que representa una respuesta de la API para los videos
 * @interface ApiVideosResponse
 * @property {boolean} success - Si la respuesta fue exitosa
 * @property {Object} data - Datos de la respuesta
 */
export interface ApiVideosResponse {
  success: boolean;
  data: {
    results: Video[];
  };
}

/**
 * Interfaz que representa una respuesta de la API para los proveedores
 * @interface ApiProvidersResponse
 * @property {boolean} success - Si la respuesta fue exitosa
 * @property {Object} data - Datos de la respuesta
 */
export interface ApiProvidersResponse {
  success: boolean;
  data: {
    results: {
      [region: string]: {
        flatrate?: Provider[];
        rent?: Provider[];
        buy?: Provider[];
      };
    };
  };
}

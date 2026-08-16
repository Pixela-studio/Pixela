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
 * Image
 * @interface ApiImage
 * @property {string} file_path - URL de la imagen
 * @property {number} width - Ancho de la imagen
 * @property {number} height - Alto de la imagen
 * @property {number} aspect_ratio - Relación de aspecto de la imagen
 * @property {number} vote_average - Puntuación promedio de la imagen
 * @property {number} vote_count - Cantidad de votos de la imagen
 */
export interface ApiImage {
  file_path: string;
  width: number;
  height: number;
  aspect_ratio: number;
  vote_average: number;
  vote_count: number;
}

/**
 * Interfaz que representa una película desde la API
 * @interface ApiPelicula
 * @property {number} id - ID único de la película
 * @property {string} [nombre] - Nombre de la película en español
 * @property {string} [titulo] - Título de la película en español
 * @property {string} [name] - Nombre de la película en inglés
 * @property {string} [title] - Título de la película en inglés
 * @property {string} [descripcion] - Descripción de la película en español
 * @property {string} [sinopsis] - Sinopsis de la película en español
 * @property {string} [overview] - Resumen de la película en inglés
 * @property {string} [fecha_estreno] - Fecha de estreno en formato español
 * @property {string} [fecha] - Fecha alternativa en formato español
 * @property {string} [release_date] - Fecha de estreno en formato inglés
 * @property {Array<string | { nombre?: string; name?: string }>} [generos] - Lista de géneros de la película
 * @property {string} [poster_path] - Ruta del póster en la API
 * @property {string} [poster] - URL alternativa del póster
 * @property {string} [backdrop_path] - Ruta de la imagen de fondo en la API
 * @property {string} [backdrop] - URL alternativa de la imagen de fondo
 * @property {number} [vote_average] - Puntuación promedio en formato decimal
 * @property {number} [puntuacion] - Puntuación alternativa
 * @property {number} [runtime] - Duración en minutos
 * @property {number} [duracion] - Duración alternativa en minutos
 * @property {ApiActor[]} [actores] - Lista de actores principales
 * @property {ApiTrailer[]} [trailers] - Lista de trailers disponibles
 * @property {ApiProvider[]} [proveedores] - Lista de proveedores de streaming
 * @property {Object} [imagenes] - Objeto que contiene las imágenes de la película
 * @property {ApiImage[]} [imagenes.backdrops] - Imágenes de fondo
 * @property {ApiImage[]} [imagenes.posters] - Pósters de la película
 * @property {ApiCreator} [creador] - Información del creador/director
 * @property {Object} [credits] - Objeto que contiene los créditos de la película
 * @property {ApiActor[]} [credits.cast] - Lista completa del elenco
 * @property {Object} [videos] - Objeto que contiene los videos de la película
 * @property {ApiTrailer[]} [videos.results] - Lista de videos/trailers
 */
export interface ApiPelicula {
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
  release_date?: string;
  generos?: Array<string | { nombre?: string; name?: string }>;
  poster_path?: string;
  poster?: string;
  backdrop_path?: string;
  backdrop?: string;
  vote_average?: number;
  puntuacion?: number;
  runtime?: number;
  duracion?: number;
  actores?: ApiActor[];
  trailers?: ApiTrailer[];
  proveedores?: ApiProvider[];
  imagenes?: {
    backdrops: ApiImage[];
    posters: ApiImage[];
  };
  creador?: ApiCreator;
  credits?: {
    cast?: ApiActor[];
  };
  videos?: {
    results?: ApiTrailer[];
  };
  results?: ApiTrailer[];
} 

/**
 * Interfaz que representa una respuesta de la API
 * @interface ApiResponse
 * @property {boolean} success - Si la respuesta fue exitosa
 * @property {T} data - Datos de la respuesta
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
    results: ApiTrailer[];
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
        flatrate?: ApiProvider[];
        rent?: ApiProvider[];
        buy?: ApiProvider[];
      };
    };
  };
}


/**
 * Base URL de la API interna.
 *
 * En navegador y fuera de localhost se fuerza la ruta relativa `/api`: usar la
 * variable de entorno allí arrastraba la URL de desarrollo a producción.
 */
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      return "/api";
    }
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
};

export const API_BASE_URL = getBaseUrl();

/** Alias histórico; se mantiene porque hay call sites que importan `API_URL`. */
export const API_URL = API_BASE_URL;

/**
 * Endpoints de la API interna.
 *
 * Se han eliminado las entradas que apuntaban a rutas inexistentes heredadas del
 * backend Laravel (`/auth/login`, `/auth/logout`, `/{tipo}/{id}/cast`,
 * `/videos`, `/watch-providers`) y las listas que nadie consumía. Los datos de
 * reparto, trailers y plataformas llegan dentro del detalle vía
 * `append_to_response`, no por endpoints propios.
 */
export const API_ENDPOINTS = {
  SERIES: {
    GET_BY_ID: (id: string) => `${API_BASE_URL}/series/${id}`,
    GET_IMAGES: (id: string) => `${API_BASE_URL}/series/${id}/images`,
  },

  PELICULAS: {
    GET_BY_ID: (id: string) => `${API_BASE_URL}/movies/${id}`,
    GET_IMAGES: (id: string) => `${API_BASE_URL}/movies/${id}/images`,
  },

  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    USER: `${API_BASE_URL}/auth/user`,
  },

  USERS: {
    LIST: `${API_BASE_URL}/users`,
    CREATE: `${API_BASE_URL}/users`,
    UPDATE: `${API_BASE_URL}/users/:id`,
    DELETE: `${API_BASE_URL}/users/:id`,
  },

  FAVORITES: {
    ADD: `${API_BASE_URL}/favorites`,
    DELETE: `${API_BASE_URL}/favorites/:id`,
    DETAILS: `${API_BASE_URL}/favorites/details`,
  },

  REVIEWS: {
    LIST: `${API_BASE_URL}/reviews`,
    BY_MEDIA: `${API_BASE_URL}/reviews/media/:tmdbId/:itemType`,
    CREATE: `${API_BASE_URL}/reviews`,
    UPDATE: `${API_BASE_URL}/reviews/:id`,
    DELETE: `${API_BASE_URL}/reviews/:id`,
  },

  CATEGORIES: {
    LIST: `${API_BASE_URL}/tmdb/categories`,
  },
} as const;

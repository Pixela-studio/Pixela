import { API_URL } from './apiEndpoints';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Extrae el mensaje legible que devuelve la API en `{ success: false, error }`.
 *
 * `ApiError.message` es siempre "Request failed with status NNN", que no dice
 * nada al usuario. El detalle útil viaja en el cuerpo de la respuesta.
 */
export function parseApiErrorMessage(
  error: unknown,
  fallback = 'Ha ocurrido un error inesperado',
): string {
  if (!(error instanceof ApiError) || !error.response) return fallback;

  try {
    const parsed = JSON.parse(error.response) as { error?: string; message?: string };
    return parsed.error || parsed.message || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Opciones por defecto para las peticiones fetch
 * @type {RequestInit}
 */
export const DEFAULT_FETCH_OPTIONS = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  cache: 'no-store' as RequestCache
};

/**
 * Helper para hacer peticiones a la API
 * @param {string} url - URL de la petición
 * @param {RequestInit} options - Opciones de la petición
 * @returns {Promise<T>} - Respuesta de la petición
 */
const normalizeUrl = (url: string): string => {
  if (url.startsWith('http') || url.startsWith('/api')) {
    return url;
  }
  
  const cleanBase = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBase}${cleanUrl}`;
};

export async function fetchFromAPI<T>(url: string, options: RequestInit = {}): Promise<T> {
  const fullUrl = normalizeUrl(url);
    
  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(
      `Request failed with status ${response.status}`,
      response.status,
      errorText
    );
  }
  
  return await response.json();
}

/**
 * Helper para hacer fetch con manejo de errores unificado
 *
 * Nota: `DEFAULT_FETCH_OPTIONS` fuerza `cache: "no-store"`. Es correcto para
 * datos de usuario (favoritos, biblioteca, reseñas), pero **no** lo uses para
 * catálogo público: eso obliga a una petición nueva en cada llamada. El
 * catálogo se resuelve en el servidor con `fetchFromTmdb`, que sí cachea.
 *
 * @param url - URL de la petición
 * @returns - Respuesta de la petición o null si hay error
 */
export async function fetchWithErrorHandling<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, DEFAULT_FETCH_OPTIONS);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new ApiError(`HTTP ${response.status}`, response.status);
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
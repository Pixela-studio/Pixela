import { DiscoverResponse, TrendingSerie, TrendingMovie } from "@/features/discover/types/media";
import { API_BASE_URL } from "@/api/shared/apiEndpoints"; // PRODUCTION: Cambiar {API_BASE_URL} por {API_URL}
import { DEFAULT_FETCH_OPTIONS } from "@/api/shared/apiHelpers";

const DISCOVER_LIMIT = 7;

type MediaType = 'series' | 'movies';

/**
 * Función base para obtener contenido descubierto
 * @param type - Tipo de contenido a obtener ('series' o 'movies')
 * @returns Lista de contenido descubierto (máximo 7)
 */
async function fetchDiscoveredContent<T>(type: MediaType): Promise<T[]> {
    try {
        const endpoint = `${API_BASE_URL}/${type}/discover?limit=${DISCOVER_LIMIT}`;

        const response = await fetch(endpoint, {
            ...DEFAULT_FETCH_OPTIONS,
        });
        
        if (!response.ok) {
            throw new Error(`Error de API: ${response.status} ${response.statusText}`);
        }

        const data: DiscoverResponse = await response.json();
        return (data.data as T[]).slice(0, DISCOVER_LIMIT);

    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error(`Error fetching discovered ${type}:`, error);
        }
        return [];
    }
}

/**
 * Obtiene las series descubiertas
 * @returns Lista de series descubiertas (máximo 7)
 */
export const getDiscoveredSeries = (): Promise<TrendingSerie[]> => 
    fetchDiscoveredContent<TrendingSerie>('series');

/**
 * Obtiene las películas descubiertas
 * @returns Lista de películas descubiertas (máximo 7)
 */
export const getDiscoveredMovies = (): Promise<TrendingMovie[]> => 
    fetchDiscoveredContent<TrendingMovie>('movies'); 
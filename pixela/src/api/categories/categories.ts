import { API_ENDPOINTS } from '@/api/shared/apiEndpoints';
import { fetchFromAPI } from '@/api/shared/apiHelpers';
import { Category, CategoriesApiResponse } from './types';

// Re-exportar tipos para facilitar las importaciones
export type { Category } from './types';

/**
 * Categorías que son específicas para películas y no deberían aparecer en series
 * ID 10402 - Principalmente para documentales musicales
 * ID 10770 - Específico de películas para TV
 * ID 10752 - Principalmente películas de guerra
 * ID 27 - Aunque hay series de terror, es predominantemente de películas
 * ID 53 - Thriller, principalmente películas
 * ID 37 - Género principalmente de películas
 */
const MOVIE_ONLY_CATEGORIES = [
    'Música',         
    'Película de TV',
    'Bélica',       
    'Terror',      
    'Suspense',    
    'Western'        
];

/**
 * IDs de categorías específicas de películas (basado en TMDB genre IDs)
 * ID 10402 - Música
 * ID 10770 - Película de TV
 * ID 10752 - Bélica
 * ID 27 - Terror
 * ID 53 - Suspense/Thriller
 * ID 37 - Western
 */
const MOVIE_ONLY_CATEGORY_IDS = [
    10402, 
    10770, 
    10752, 
    27,    
    53,    
    37     
];

/**
 * Obtiene todas las categorías disponibles
 * @returns Array de categorías
 */
export async function getAllCategories(): Promise<Category[]> {
    const apiUrl = API_ENDPOINTS.CATEGORIES.LIST;

    try {
        const data = await fetchFromAPI<CategoriesApiResponse>(apiUrl);
        return data.success ? (data.data || []) : [];
    } catch (error) {
        console.error('[ERROR] getAllCategories:', error);
        throw error;
    }
}

/**
 * Obtiene categorías filtradas según el tipo de medio
 * @param mediaType Tipo de medio ('movies', 'series', 'all')
 * @returns Array de categorías filtradas
 */
export async function getCategoriesForMediaType(mediaType: 'movies' | 'series' | 'all'): Promise<Category[]> {
    const allCategories = await getAllCategories();
    
    if (mediaType === 'all' || mediaType === 'movies') {
        return allCategories;
    }
    
    if (mediaType === 'series') {
        return allCategories.filter(category => {
            const isMovieOnlyByName = MOVIE_ONLY_CATEGORIES.includes(category.name);
            const isMovieOnlyById = MOVIE_ONLY_CATEGORY_IDS.includes(category.id);
            
            return !isMovieOnlyByName && !isMovieOnlyById;
        });
    }
    
    return allCategories;
} 
import { API_ENDPOINTS } from '@/api/shared/apiEndpoints';
import { DEFAULT_FETCH_OPTIONS } from '@/api/shared/apiHelpers';
import { WallpapersResponse } from '@/features/media/types/gallery';


/**
 * Obtiene las imágenes de una película o serie
 * @param {string} mediaId - ID de la película o serie
 * @param {'movie' | 'series'} mediaType - Tipo de media
 * @returns {Promise<WallpapersResponse>} Respuesta con las imágenes
 */
export async function getMediaImages(
  mediaId: string, 
  mediaType: 'movie' | 'series'
): Promise<WallpapersResponse> {
  // Determine which endpoint to use based on media type
  const apiUrl = mediaType === 'movie' 
    ? `${API_ENDPOINTS.PELICULAS.GET_IMAGES(mediaId)}`
    : `${API_ENDPOINTS.SERIES.GET_IMAGES(mediaId)}`;

  try {
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(apiUrl, {
      ...DEFAULT_FETCH_OPTIONS,
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      if (process.env.NODE_ENV === 'development') {
        console.error(`[ERROR] getMediaImages - Status code ${response.status}, Response: ${errorText}`);
      }
      return { backdrops: [], posters: [], logos: [] };
    }

    const data = await response.json();

    // If API returns an error or empty object handling
    if (!data.id && !data.backdrops && !data.posters) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[WARN] getMediaImages - Empty or invalid data received');
      }
      return { backdrops: [], posters: [], logos: [] };
    }

    const result: WallpapersResponse = {
      backdrops: Array.isArray(data.backdrops) ? data.backdrops : [],
      posters: Array.isArray(data.posters) ? data.posters : [],
      logos: Array.isArray(data.logos) ? data.logos : []
    };

    return result;
    
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ERROR] getMediaImages:', error);
    }
    return { backdrops: [], posters: [], logos: [] };
  }
} 
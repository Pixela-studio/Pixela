/**
 * Reseña
 * @interface Review
 * @property {number} id - ID de la reseña
 * @property {number} user_id - ID del usuario
 * @property {string} user_name - Nombre del usuario
 * @property {string} photo_url - URL de la imagen del usuario
 * @property {string} item_type - Tipo de elemento (película o serie)
 * @property {number} tmdb_id - ID de la película o serie
 * @property {number} rating - Puntuación de la reseña
 * @property {string} review - Reseña
 * @property {string} created_at - Fecha de creación de la reseña
 * @property {string} updated_at - Fecha de actualización de la reseña
 * @property {string} title - Título de la película o serie
 * @property {string} poster_path - URL de la imagen de la película o serie
 */
export interface Review {
    id: number;
    user_id: number;
    user_name: string;
    photo_url?: string;
    item_type: 'movie' | 'series';
    tmdb_id: number;
    rating: number;
    review: string;
    created_at: string;
    updated_at: string;
    title?: string;
    poster_path?: string;
    /** `false` = «solo para mí». */
    is_public?: boolean;
}

/**
 * Campos requeridos para crear una reseña
 * @interface CreateReview
 * @property {string} item_type - Tipo de elemento (película o serie)
 * @property {number} tmdb_id - ID de la película o serie
 * @property {number} rating - Puntuación de la reseña
 * @property {string} review - Reseña
 */
export interface CreateReview {
    item_type: 'movie' | 'series';
    tmdb_id: number;
    rating: number;
    review: string;
    /** `false` = «solo para mí». */
    is_public?: boolean;
}
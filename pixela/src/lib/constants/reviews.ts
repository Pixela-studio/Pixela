/**
 * Límites de las reseñas, compartidos por el formulario y la validación de la API.
 *
 * Estaban duplicados y desalineados: el modal aceptaba hasta 5000 caracteres y
 * el servidor rechazaba por encima de 2000, así que una reseña larga pasaba la
 * validación del cliente y volvía como un 400 con un mensaje genérico.
 */
export const REVIEW_MAX_LENGTH = 2000;

/** Puntuación mínima y máxima (escala 0-10, media estrella = 1 punto). */
export const REVIEW_MIN_RATING = 1;
export const REVIEW_MAX_RATING = 10;

import { Review } from '@/api/reviews/types';

/**
 * Interfaz que define el estado global del feature Media.
 * 
 * Esta interfaz contiene todos los estados y acciones necesarias para manejar:
 * - Modal del poster
 * - Sistema de reseñas
 * - Galería de imágenes
 * - Reproductor de trailers
 * 
 * @interface MediaState
 */
export interface MediaState {
  /**
   * Estado que controla la visibilidad del modal del poster
   * @property {boolean} showPosterModal - Indica si el modal está visible
   * @property {function} setShowPosterModal - Función para actualizar la visibilidad del modal
   */
  showPosterModal: boolean;
  setShowPosterModal: (show: boolean) => void;

  /**
   * Estado que maneja el sistema de reseñas
   * @property {Review[]} reviews - Lista de reseñas
   * @property {boolean} loadingReviews - Indica si se están cargando las reseñas
   * @property {string | null} errorReviews - Mensaje de error si la carga falla
   * @property {function} setReviews - Función para actualizar la lista de reseñas
   * @property {function} setLoadingReviews - Función para actualizar el estado de carga
   * @property {function} setErrorReviews - Función para actualizar el mensaje de error
   */
  reviews: Review[];
  loadingReviews: boolean;
  errorReviews: string | null;
  setReviews: (reviews: Review[]) => void;
  setLoadingReviews: (loading: boolean) => void;
  setErrorReviews: (error: string | null) => void;

  /**
   * Estado que maneja la galería de imágenes
   * @property {'backdrops' | 'posters'} activeGalleryTab - Tab activo de la galería
   * @property {function} setActiveGalleryTab - Función para cambiar el tab activo
   * @property {string | null} selectedGalleryImage - URL de la imagen seleccionada
   * @property {function} setSelectedGalleryImage - Función para actualizar la imagen seleccionada
   */
  activeGalleryTab: 'backdrops' | 'posters';
  setActiveGalleryTab: (tab: 'backdrops' | 'posters') => void;
  selectedGalleryImage: string | null;
  setSelectedGalleryImage: (image: string | null) => void;
} 
import { create } from 'zustand';
import { MediaState } from './types';

/**
 * Store de Zustand para el feature Media.
 * 
 * Este store centraliza la gestión del estado para la página de detalles de media,
 * proporcionando un estado global accesible desde cualquier componente del feature.
 * 
 * El store maneja cuatro áreas principales:
 * 1. Modal del poster: Control de visibilidad del modal de imagen grande
 * 2. Sistema de reseñas: Estado de carga, datos y errores de las reseñas
 * 3. Galería: Navegación entre tabs y selección de imágenes
 * 4. Trailers: Control del reproductor de trailers
 * 
 */
export const useMediaStore = create<MediaState>((set) => ({

  /**
   * Control del Modal del Poster
   * @property {boolean} showPosterModal - Indica si el modal está visible
   * @property {function} setShowPosterModal - Función para actualizar la visibilidad del modal
   */
  showPosterModal: false,
  setShowPosterModal: (show) => set({ showPosterModal: show }),

  /**
   * Control del Sistema de reseñas
   * @property {Review[]} reviews - Lista de reseñas
   * @property {boolean} loadingReviews - Indica si se están cargando las reseñas
   * @property {string | null} errorReviews - Mensaje de error si la carga falla
   * @property {function} setReviews - Función para actualizar la lista de reseñas
   * @property {function} setLoadingReviews - Función para actualizar el estado de carga
   * @property {function} setErrorReviews - Función para actualizar el mensaje de error
   */
  reviews: [],
  loadingReviews: false,
  errorReviews: null,
  setReviews: (reviews) => set({ reviews }),
  setLoadingReviews: (loading) => set({ loadingReviews: loading }),
  setErrorReviews: (error) => set({ errorReviews: error }),

  /**
   * Control de la Galería de imágenes
   * @property {'backdrops' | 'posters'} activeGalleryTab - Tab activo de la galería
   * @property {function} setActiveGalleryTab - Función para cambiar el tab activo
   * @property {string | null} selectedGalleryImage - URL de la imagen seleccionada
   * @property {function} setSelectedGalleryImage - Función para actualizar la imagen seleccionada
   */
  activeGalleryTab: 'backdrops',
  setActiveGalleryTab: (tab) => set({ activeGalleryTab: tab }),
  selectedGalleryImage: null,
  setSelectedGalleryImage: (image) => set({ selectedGalleryImage: image }),


})); 
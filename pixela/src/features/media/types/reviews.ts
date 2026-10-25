import { Review } from '@/api/reviews/types';

/**
 * Props para el componente ReviewModal
 * @interface ReviewModalProps
 * @property {boolean} isOpen - Indica si el modal está abierto
 * @property {() => void} onClose - Función que se ejecuta al cerrar el modal
 * @property {number} tmdbId - ID de la película o serie en TMDB
 * @property {'movie' | 'series'} itemType - Tipo de película o serie
 * @property {string} title - Título de la película o serie
 * @property {() => void} [refreshReviews] - Función que se ejecuta al actualizar las reseñas
 */
export interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    tmdbId: number;
    itemType: 'movie' | 'series';
    title: string;
    refreshReviews?: () => void;
  }

/**
 * Propiedades del componente ReviewSection
 * @interface ReviewSectionProps
 * @property {number} tmdbId - ID de la película o serie en TMDB
 * @property {'movie' | 'series'} itemType - Tipo de película o serie
 * @property {Review[]} reviews - Lista de reseñas
 * @property {boolean} loading - Indica si se está cargando la sección      
 * @property {string | null} error - Indica si hay un error en la sección
 * @property {() => void} refreshReviews - Función que se ejecuta al actualizar las reseñas
 */
export interface ReviewSectionProps {
  tmdbId: number;
  itemType: 'movie' | 'series';
  reviews: Review[];
  /** Título de la obra, para los nombres accesibles de editar y borrar. */
  mediaTitle?: string;
  loading: boolean;
  error: string | null;
  refreshReviews: () => void;
}

/**
 * Propiedades del componente ReviewCard
 * @interface ReviewCardProps
 * @property {Review} review - Reseña a mostrar
 * @property {boolean} isUserReview - Indica si la reseña pertenece al usuario actual
 * @property {boolean} isEditing - Indica si la reseña está en modo edición
 * @property {() => void} onEditClick - Función que se ejecuta al hacer clic en editar
 * @property {() => void} onSave - Función que se ejecuta al guardar los cambios
 * @property {() => void} onCancel - Función que se ejecuta al cancelar la edición
 * @property {() => void} onDelete - Función que se ejecuta al eliminar la reseña
 * @property {boolean} isDeleting - Indica si se está eliminando la reseña
 */
export interface ReviewCardProps {
  review: Review;
  isUserReview: boolean;
  isEditing: boolean;
  onEditClick: (review: Review) => void;
  onSave: (text: string, rating: number) => void;
  onCancel: () => void;
  onDelete: (review: Review) => void;
  isDeleting: boolean;
}

/**
 * Propiedades del componente ReviewEditForm
 * @interface ReviewEditFormProps
 * @property {string} editText - Texto de la reseña en edición
 * @property {number} editRating - Puntuación de la reseña en edición
 * @property {(text: string, rating: number) => void} onSave - Función que se ejecuta al guardar los cambios
 * @property {() => void} onCancel - Función que se ejecuta al cancelar la edición
 */
export interface ReviewEditFormProps {
  editText: string;
  editRating: number;
  onSave: (text: string, rating: number) => void;
  onCancel: () => void;
}

/**
 * Propiedades del componente StarDisplay
 * @interface StarDisplayProps
 * @property {number} value - Puntuación de la reseña
 */
export interface StarDisplayProps {
  value: number;
} 
"use client";

import { useEffect, useId, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FiX, FiStar } from 'react-icons/fi';
import { reviewsAPI } from '@/api/reviews/reviews';
import { CreateReview } from '@/api/reviews/types';
import { ReviewModalProps } from '@/features/media/types/reviews';
import { parseApiErrorMessage } from '@/api/shared/apiHelpers';
import { REVIEW_MAX_LENGTH } from '@/lib/constants/reviews';

const STYLES = {
  // Estilos del modal y overlay
  modal: {
    overlay: "fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4",
    container: "bg-[#1A1A1A] rounded-xl w-full max-w-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto relative"
  },
  // Estilos del header
  header: {
    container: "sticky top-0 bg-[#1A1A1A] flex items-center justify-between p-6 border-b border-white/10 z-10",
    title: "text-xl font-semibold text-white",
    closeButton: "text-gray-400 transition-colors hover:text-white"
  },
  // Estilos del contenido
  content: {
    container: "p-6",
    title: "mb-2 text-lg font-medium text-white",
    rating: {
      label: "block mb-2 text-sm font-medium text-gray-300",
      container: "flex items-center gap-2",
      value: "ml-4 text-sm text-gray-400"
    },
    review: {
      label: "block mb-2 text-sm font-medium text-gray-300",
      textarea: "w-full h-32 bg-[#252525] border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-pixela-accent transition-colors resize-none"
    },
    error: "p-3 mb-4 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20",
    errorSimple: "mb-2 text-sm text-pixela-accent italic",
    success: "mb-2 text-sm text-green-400 italic",
    submit: {
      container: "flex justify-end",
      button: "flex items-center gap-2 px-6 py-2 font-medium text-white transition-colors rounded-lg bg-pixela-accent hover:bg-pixela-accent/90 disabled:opacity-50 disabled:cursor-not-allowed",
      spinner: "w-5 h-5 border-2 rounded-full border-white/20 border-t-white animate-spin"
    }
  }
} as const;

interface ReviewFormData {
  rating: number;
  review: string;
}

/**
 * Componente que muestra la estrella de la reseña
 * @param {boolean} filled - Indica si la estrella está llena
 * @param {boolean} half - Indica si la estrella está media llena
 * @returns {JSX.Element} Componente de estrella de la reseña
 */
const Star = ({ filled, half }: { filled: boolean; half?: boolean }) => (
  <span className="relative inline-block w-6 h-6">
    <FiStar className={`w-6 h-6 absolute top-0 left-0 ${filled ? 'text-yellow-400' : 'text-gray-400'}`} />
    {half && (
      <FiStar
        className="absolute top-0 left-0 w-6 h-6 text-yellow-400"
        style={{ clipPath: 'inset(0 50% 0 0)' }}
      />
    )}
  </span>
);

/**
 * Componente que muestra el modal de reseña
 * @param {ReviewModalProps} props - Propiedades del componente
 * @param {boolean} props.isOpen - Indica si el modal está abierto
 * @param {() => void} props.onClose - Función que se ejecuta al cerrar el modal
 * @param {number} props.tmdbId - ID de la película o serie en TMDB
 * @param {'movie' | 'series'} props.itemType - Tipo de película o serie
 * @param {string} props.title - Título de la película o serie
 * @param {() => void} [props.refreshReviews] - Función que se ejecuta al actualizar las reseñas
 * @returns {JSX.Element} Componente de modal de reseña
 */
export const ReviewModal = ({ isOpen, onClose, tmdbId, itemType, title, refreshReviews }: ReviewModalProps) => {
  const { 
    handleSubmit, 
    control, 
    register, 
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ReviewFormData>({
    defaultValues: {
      rating: 6, // Default: 3 estrellas (6/10)
      review: ''
    }
  });

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (isOpen) return;

    // Retrasar el reseteo para que no se vea el cambio antes de que se cierre el modal
    const timer = setTimeout(() => {
      reset({ rating: 6, review: '' });
      setApiError(null);
      setSuccess(null);
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, reset]);

  // Escape para cerrar y bloqueo del scroll de fondo: el diálogo solo se podía
  // cerrar con el ratón y la página seguía desplazándose por detrás.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  /**
   * Función que cierra el modal
   */
  const handleClose = () => {
    onClose();
  };

  /**
   * Función que se ejecuta al hacer clic en el botón de enviar
   * @param {ReviewFormData} data - Datos del formulario
   * @returns {Promise<void>}
   */
  const onSubmit = async (data: ReviewFormData) => {
    setApiError(null);
    setSuccess(null);

    try {
      const reviewData: CreateReview = {
        tmdb_id: tmdbId,
        item_type: itemType,
        rating: data.rating,
        review: data.review
      };
      await reviewsAPI.add(reviewData);
      
      // La API hace upsert: la misma acción crea o actualiza, así que el
      // mensaje ya no puede afirmar que se ha creado.
      setSuccess('¡Reseña guardada correctamente!');

      setTimeout(() => {
        handleClose();
        if (refreshReviews) refreshReviews();
      }, 1500);

    } catch (error: unknown) {
      // Se comparaba con 'Review already exists', una cadena que la API nunca
      // devuelve: `ApiError.message` es siempre "Request failed with status N".
      // El motivo real viaja en el cuerpo de la respuesta.
      setApiError(
        parseApiErrorMessage(
          error,
          'No se pudo guardar la reseña. Por favor, inténtalo de nuevo.',
        ),
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={STYLES.modal.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div 
        className={STYLES.modal.container}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={STYLES.header.container}>
          <h2 id={titleId} className={STYLES.header.title}>Escribir Reseña</h2>
          <button
            onClick={handleClose}
            className={STYLES.header.closeButton}
            type="button"
            aria-label="Cerrar"
          >
            <FiX className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className={STYLES.content.container}>
          <div className="mb-6">
            <h3 className={STYLES.content.title}>{title}</h3>
            
            {/* Rating */}
            <div className="mb-4">
              <label className={STYLES.content.rating.label}>
                Puntuación
              </label>
              <Controller
                name="rating"
                control={control}
                rules={{ min: { value: 1, message: "La puntuación es obligatoria." } }}
                render={({ field: { onChange, value } }) => (
                  <div className={STYLES.content.rating.container}>
                    {[1, 2, 3, 4, 5].map((star) => {
                      const starValue = star * 2;
                      const isFull = value >= starValue;
                      const isHalf = value === starValue - 1;
                      return (
                        <span key={star} className="relative group">
                          {/* Media estrella (izquierda) */}
                          <button
                            type="button"
                            aria-label={`Puntuar con ${star - 0.5} estrellas`}
                            className="absolute top-0 left-0 z-10 w-1/2 h-full"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onChange(star * 2 - 1)}
                          />
                          {/* Estrella completa (derecha) */}
                          <button
                            type="button"
                            aria-label={`Puntuar con ${star} estrellas`}
                            className="absolute top-0 right-0 z-10 w-1/2 h-full"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onChange(star * 2)}
                          />
                          <Star filled={isFull} half={isHalf} />
                        </span>
                      );
                    })}
                    <span className={STYLES.content.rating.value}>
                      {(value / 2) % 1 === 0 ? (value / 2) : (value / 2).toFixed(1)}/5
                    </span>
                  </div>
                )}
              />
               {errors.rating && (
                <div className="mt-2 text-sm italic text-pixela-accent">
                  {errors.rating.message}
                </div>
              )}
            </div>

            {/* Review Text */} 
            <div className="mb-2">
              <label className={STYLES.content.review.label}>
                Reseña (opcional)
              </label>
              <textarea
                {...register('review', {
                  maxLength: {
                    value: REVIEW_MAX_LENGTH,
                    message: `La reseña no puede exceder los ${REVIEW_MAX_LENGTH} caracteres`,
                  },
                })}
                maxLength={REVIEW_MAX_LENGTH}
                className={STYLES.content.review.textarea}
                placeholder="Escribe tu opinión sobre esta película o serie..."
              />
              {errors.review && (
                <div className="mt-2 text-sm italic text-pixela-accent">
                  {errors.review.message}
                </div>
              )}
            </div>

            {apiError && (
              <div className={STYLES.content.errorSimple}>
                {apiError}
              </div>
            )}

            {success && (
              <div className={STYLES.content.success}>
                {success}
              </div>
            )}

            {/* Submit */}
            <div className={STYLES.content.submit.container}>
              <button 
                type="submit" 
                className={STYLES.content.submit.button}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className={STYLES.content.submit.spinner} />
                ) : (
                  'Guardar Reseña'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}; 
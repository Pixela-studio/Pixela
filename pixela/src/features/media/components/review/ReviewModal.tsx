"use client";

import { useEffect, useId, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FiX } from 'react-icons/fi';
import { reviewsAPI } from '@/api/reviews/reviews';
import { CreateReview, Review } from '@/api/reviews/types';
import { ReviewModalProps } from '@/features/media/types/reviews';
import { parseApiErrorMessage } from '@/api/shared/apiHelpers';
import { REVIEW_MAX_LENGTH } from '@/lib/constants/reviews';
import { useAuthStore } from '@/stores/useAuthStore';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { StarRatingInput } from '@/shared/components/StarRatingInput';

const STYLES = {
  // Estilos del modal y overlay
  modal: {
    overlay: "fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4",
    container: "bg-pixela-surface rounded-2xl w-full max-w-2xl border border-white/10 shadow-2xl shadow-black/60 max-h-[90vh] overflow-y-auto relative"
  },
  // Estilos del header
  header: {
    container: "sticky top-0 bg-pixela-surface flex items-center justify-between p-6 border-b border-white/10 z-10",
    title: "text-xl font-semibold text-white",
    closeButton: "rounded-full p-2 text-white/70 transition-colors duration-200 hover:text-white"
  },
  // Estilos del contenido
  content: {
    container: "p-6",
    title: "mb-4 text-lg font-medium text-white",
    rating: {
      label: "block mb-2 text-sm font-medium text-white/70",
    },
    review: {
      label: "block mb-2 text-sm font-medium text-white/70",
      // `focus:outline-none` con sustituto: borde de acento y anillo `focus-visible`.
      textarea: "w-full h-32 bg-pixela-raised border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/40 hover:border-white/20 focus:border-pixela-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent/30 transition-[border-color,box-shadow] duration-200 ease-out-expo resize-none",
      counter: "mt-1 text-right text-xs tabular-nums text-white/55",
    },
    fieldError: "mt-2 text-sm text-red-400",
    apiError: "mb-4 p-3 text-sm text-red-400 border rounded-xl bg-red-500/10 border-red-500/20",
    success: "mb-4 text-sm text-emerald-400",
    loading: "mb-4 text-sm text-white/55",
    submit: {
      container: "flex justify-end gap-3",
      button: "btn btn-primary btn-sm",
      cancel: "btn btn-ghost btn-sm",
      spinner: "w-5 h-5 border-2 rounded-full border-white/20 border-t-white animate-spin"
    }
  }
} as const;

interface ReviewFormData {
  /** `null` hasta que se elige una nota: el modal no propone ninguna. */
  rating: number | null;
  review: string;
}

const EMPTY_FORM: ReviewFormData = { rating: null, review: '' };

interface ReviewModalWithExistingProps extends ReviewModalProps {
  /**
   * Reseña del usuario para este título, si el padre ya la tiene a mano (la
   * lista de reseñas de la ficha). `null` = se sabe que no hay; sin pasar = se
   * busca al abrir.
   */
  existingReview?: Review | null;
}

/**
 * Modal para escribir o editar la reseña propia de un título.
 *
 * La API hace upsert por (usuario, título), así que si ya existe una reseña se
 * precarga y el modal se titula "Editar tu reseña": antes se mostraba vacío y
 * guardar sustituía la anterior sin avisar.
 */
export const ReviewModal = ({
  isOpen,
  onClose,
  tmdbId,
  itemType,
  title,
  refreshReviews,
  existingReview: existingReviewProp,
}: ReviewModalWithExistingProps) => {
  const {
    handleSubmit,
    control,
    register,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ReviewFormData>({ defaultValues: EMPTY_FORM });

  const userId = useAuthStore((state) => state.user?.user_id);
  const [fetchedReview, setFetchedReview] = useState<Review | null>(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const titleId = useId();
  const ratingLabelId = useId();
  const ratingErrorId = useId();
  const textareaId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const existingReview = existingReviewProp !== undefined ? existingReviewProp : fetchedReview;
  const isEditing = existingReview !== null;
  const rating = watch('rating');
  const reviewText = watch('review') ?? '';

  useFocusTrap(dialogRef, isOpen, { onEscape: onClose });

  // Sin reseña dada por el padre, se busca la propia entre las del título.
  // Solo al abrir y solo con sesión: es una petición por apertura, no por visita.
  useEffect(() => {
    if (!isOpen || existingReviewProp !== undefined || !userId) return;
    let cancelled = false;
    setLoadingExisting(true);
    reviewsAPI
      .getByMedia(tmdbId, itemType)
      .then((reviews) => {
        if (!cancelled) setFetchedReview(reviews.find((r) => r.user_id === userId) ?? null);
      })
      .catch(() => {
        // Sin la reseña previa el modal sigue sirviendo para escribir una nueva.
        if (!cancelled) setFetchedReview(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingExisting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, existingReviewProp, userId, tmdbId, itemType]);

  // Precargar la reseña existente en cuanto se conoce.
  useEffect(() => {
    if (!isOpen) return;
    reset(
      existingReview
        ? { rating: Number(existingReview.rating), review: existingReview.review ?? '' }
        : EMPTY_FORM,
    );
  }, [isOpen, existingReview, reset]);

  useEffect(() => {
    if (isOpen) return;

    // Retrasar el reseteo para que no se vea el cambio antes de que se cierre el modal
    const timer = setTimeout(() => {
      reset(EMPTY_FORM);
      setFetchedReview(null);
      setApiError(null);
      setSuccess(null);
    }, 300);

    return () => clearTimeout(timer);
  }, [isOpen, reset]);

  // Bloqueo del scroll de fondo mientras el diálogo está abierto.
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const onSubmit = async (data: ReviewFormData) => {
    if (data.rating === null) return;
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

      // La API hace upsert: la misma acción crea o actualiza.
      setSuccess(isEditing ? 'Reseña actualizada.' : 'Reseña guardada.');

      closeTimer.current = setTimeout(() => {
        onClose();
        if (refreshReviews) refreshReviews();
      }, 1200);

    } catch (error: unknown) {
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

  const heading = isEditing ? 'Editar tu reseña' : 'Escribir reseña';

  return (
    <div
      className={STYLES.modal.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={STYLES.modal.container}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        {/* Header */}
        <div className={STYLES.header.container}>
          <h2 id={titleId} className={STYLES.header.title}>{heading}</h2>
          <button
            onClick={onClose}
            className={STYLES.header.closeButton}
            type="button"
            aria-label="Cerrar"
          >
            <FiX className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className={STYLES.content.container} noValidate>
          <h3 className={STYLES.content.title}>{title}</h3>

          {loadingExisting && (
            <p role="status" className={STYLES.content.loading}>
              Buscando tu reseña anterior…
            </p>
          )}

          {/* Rating */}
          <div className="mb-6">
            <span id={ratingLabelId} className={STYLES.content.rating.label}>
              Puntuación
            </span>
            <Controller
              name="rating"
              control={control}
              rules={{ validate: (value) => value !== null || 'Elige una puntuación.' }}
              render={({ field: { onChange, value } }) => (
                <StarRatingInput
                  value={value}
                  onChange={onChange}
                  labelledBy={ratingLabelId}
                  errorId={errors.rating ? ratingErrorId : undefined}
                  disabled={isSubmitting || loadingExisting}
                />
              )}
            />
            {errors.rating && (
              <p id={ratingErrorId} role="alert" className={STYLES.content.fieldError}>
                {errors.rating.message}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label htmlFor={textareaId} className={STYLES.content.review.label}>
              Reseña (opcional)
            </label>
            <textarea
              id={textareaId}
              {...register('review', {
                maxLength: {
                  value: REVIEW_MAX_LENGTH,
                  message: `La reseña no puede exceder los ${REVIEW_MAX_LENGTH} caracteres`,
                },
              })}
              maxLength={REVIEW_MAX_LENGTH}
              // Mientras llega la reseña previa: lo escrito se perdería al precargarla.
              readOnly={loadingExisting}
              aria-invalid={errors.review ? true : undefined}
              aria-describedby={errors.review ? `${textareaId}-error` : undefined}
              className={STYLES.content.review.textarea}
              placeholder="¿Qué te pareció?"
            />
            <p className={STYLES.content.review.counter} aria-hidden="true">
              {reviewText.length}/{REVIEW_MAX_LENGTH}
            </p>
            {errors.review && (
              <p id={`${textareaId}-error`} role="alert" className={STYLES.content.fieldError}>
                {errors.review.message}
              </p>
            )}
          </div>

          {apiError && (
            <div role="alert" className={STYLES.content.apiError}>
              {apiError}
            </div>
          )}

          {success && (
            <p role="status" className={STYLES.content.success}>
              {success}
            </p>
          )}

          {/* Submit: desactivado hasta que hay nota. */}
          <div className={STYLES.content.submit.container}>
            <button type="button" onClick={onClose} className={STYLES.content.submit.cancel}>
              Cancelar
            </button>
            <button
              type="submit"
              className={STYLES.content.submit.button}
              disabled={rating === null || isSubmitting || loadingExisting || success !== null}
            >
              {isSubmitting ? (
                <>
                  <span className={STYLES.content.submit.spinner} aria-hidden="true" />
                  <span className="sr-only">Guardando…</span>
                </>
              ) : (
                'Guardar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

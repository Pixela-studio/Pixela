"use client";

import { FiAlertCircle } from 'react-icons/fi';
import { Review } from '@/api/reviews/types';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRef, useState } from 'react';
import { reviewsAPI } from '@/api/reviews/reviews';
import { ReviewCard } from './ReviewCard';
import { ReviewSectionProps } from '@/features/media/types/reviews';
import { ReviewsSkeleton } from '@/app/components/skeletons';
import { toast } from '@/lib/toast';

const STYLES = {
  section: {
    container: "mt-12 mb-24",
    title: "text-2xl font-bold text-white mb-8"
  },
  states: {
    loading: "flex items-center justify-center py-12",
    spinner: "w-8 h-8 text-pixela-primary animate-spin",
    error: "flex items-center justify-center py-12 text-red-400",
    errorIcon: "w-6 h-6 mr-2",
    empty: "flex flex-col items-center justify-center py-12 text-gray-400",
    emptyIcon: "w-8 h-8 mb-2",
    emptyText: "text-base font-outfit"
  },
  reviews: {
    container: "space-y-8"
  }
} as const;

/**
 * Componente que muestra la sección de reseñas
 * @param {ReviewSectionProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de sección de reseñas
 */
export function ReviewSection({ reviews, loading, error, refreshReviews }: ReviewSectionProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.user?.user_id);
  const isAdmin = useAuthStore((state) => state.user?.is_admin) ?? false;
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  /** Reseñas borradas en la vista pero aún dentro del margen para deshacer. */
  const [hiddenIds, setHiddenIds] = useState<ReadonlySet<number>>(new Set());
  const headingRef = useRef<HTMLHeadingElement>(null);

  const setHidden = (id: number, hidden: boolean) =>
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (hidden) next.add(id);
      else next.delete(id);
      return next;
    });

  const handleEditClick = (review: Review) => {
    setEditingReview(review);
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  /**
   * Función para guardar la reseña editada
   * @returns {Promise<void>}
   */
  const handleSaveEdit = async (text: string, rating: number) => {
    if (!editingReview) return;

    try {
      await reviewsAPI.update({
        ...editingReview,
        review: text,
        rating: rating,
      });

      if (refreshReviews) {
        refreshReviews();
      }

      handleCancelEdit();
    } catch (error) {
      // Antes fallaba en silencio: el formulario seguía abierto sin explicación.
      toast.error('No se pudo guardar la reseña. Inténtalo de nuevo.', { title: 'Error' });
      if (process.env.NODE_ENV === 'development') {
        console.error('Error al actualizar la reseña:', error);
      }
    }
  };

  /**
   * Borra con margen para deshacer: la tarjeta desaparece al instante y el
   * DELETE solo sale cuando el aviso se cierra sin pulsar "Deshacer".
   */
  const handleDeleteReview = (review: Review) => {
    const isOwn = review.user_id === userId;
    setHidden(review.id, true);
    // El botón pulsado desaparece con la tarjeta: el foco pasa al título de la
    // sección en vez de perderse en el `<body>`.
    headingRef.current?.focus();

    toast.undoable({
      title: 'Reseña borrada',
      message: isOwn ? 'Tu reseña se ha borrado.' : `Se ha borrado la reseña de ${review.user_name || 'este usuario'}.`,
      onUndo: () => setHidden(review.id, false),
      onCommit: async () => {
        try {
          await reviewsAPI.delete(review.id);
          refreshReviews?.();
        } catch (error) {
          setHidden(review.id, false);
          toast.error('No se pudo borrar la reseña.', { title: 'Error' });
          if (process.env.NODE_ENV === 'development') {
            console.error('Error al eliminar la reseña:', error);
          }
        }
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div className={STYLES.section.container}>
        <h2 className={STYLES.section.title}>Reseñas de usuarios</h2>
        <div className={STYLES.states.empty}>
          <FiAlertCircle className={STYLES.states.emptyIcon} />
          <p className={STYLES.states.emptyText}>Inicia sesión para ver y escribir reseñas.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <ReviewsSkeleton count={3} />;
  }

  if (error) {
    return (
      <div role="alert" className={STYLES.states.error}>
        <FiAlertCircle className={STYLES.states.errorIcon} aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  const visibleReviews = reviews.filter((review) => !hiddenIds.has(review.id));

  return (
    <div className={STYLES.section.container}>
      <h2 ref={headingRef} tabIndex={-1} className={STYLES.section.title}>Reseñas de usuarios</h2>
      {visibleReviews.length === 0 ? (
        <div className={STYLES.states.empty}>
          <FiAlertCircle className={STYLES.states.emptyIcon} />
          <p className={STYLES.states.emptyText}>No hay reseñas para este título.</p>
        </div>
      ) : (
        <div className={STYLES.reviews.container}>
          {visibleReviews.map((review) => {
            const isUserReview = review.user_id === userId;
            const isEditing = editingReview?.id === review.id;

            return (
              <ReviewCard
                key={review.id}
                review={review}
                // PUT solo admite al autor; DELETE, al autor o a un admin. El
                // admin veía "editar" en reseñas ajenas y el PUT fallaba en silencio.
                isUserReview={isUserReview}
                canDelete={isUserReview || isAdmin}
                mediaTitle={review.title}
                isEditing={isEditing}
                onEditClick={handleEditClick}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
                onDelete={handleDeleteReview}
                isDeleting={false}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

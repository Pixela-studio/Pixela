"use client";

import { FiEdit2, FiLoader } from 'react-icons/fi';
import { FaTrash } from 'react-icons/fa';
import Image from 'next/image';
import { StarDisplay } from './StarDisplay';
import { ReviewEditForm } from './ReviewEditForm';
import { ReviewCardProps } from '@/features/media/types/reviews';
import { useInteractiveBorder } from '@/hooks';

const STYLES = {
  // Contenedor principal con efecto de borde interactivo (igual que las cards de about)
  card: "group relative rounded-2xl p-px cursor-pointer overflow-hidden transition-all duration-300",
  // Borde animado que sigue al mouse (igual que las cards de about)
  cardBorder: "absolute inset-0 rounded-2xl bg-[radial-gradient(250px_at_var(--mouse-x)_var(--mouse-y),_rgba(236,27,105,0.8),_transparent_75%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300",
  // Contenido de la card con fondo degradado (igual que las cards de about)
  cardContent: "relative z-10 h-full rounded-[15px] px-6 py-5 flex flex-col gap-3 bg-gradient-to-br from-pixela-dark/95 to-pixela-dark/95 shadow-2xl shadow-pixela-accent/5 transition-all duration-300",
  
  header: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
  user: {
    container: "flex items-center gap-3",
    avatar: {
      container: "inline-flex items-center justify-center w-8 h-8 rounded-full bg-pixela-accent/20 text-pixela-accent font-bold text-lg overflow-hidden",
      image: "object-cover w-8 h-8 rounded-full",
      icon: "w-5 h-5"
    },
    name: "font-semibold text-white text-base group-hover:text-pixela-accent transition-colors duration-300",
    date: "text-xs text-gray-400 font-mono min-w-20"
  },
  rightSection: {
    container: "flex items-center gap-2 justify-end min-w-32"
  },
  edit: {
    button: "p-2 text-gray-400 hover:text-white transition-colors duration-200",
    icon: "w-4 h-4"
  },
  actions: {
    container: "flex items-center gap-1"
  },
  delete: {
    button: "p-2 text-gray-400 hover:text-red-400 transition-colors duration-200",
    icon: "w-4 h-4"
  },
  content: {
    text: "text-gray-200 text-lg leading-relaxed mt-2 whitespace-pre-line"
  }
} as const;


/**
 * Componente que muestra una tarjeta de reseña
 * @param {ReviewCardProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de tarjeta de reseña
 */
export const ReviewCard = ({
  review,
  isUserReview,
  isEditing,
  onEditClick,
  onSave,
  onCancel,
  onDelete,
  isDeleting
}: ReviewCardProps) => {
  const cardRef = useInteractiveBorder<HTMLDivElement>();

  return (
    <div ref={cardRef} className={STYLES.card}>
      <div className={STYLES.cardBorder} />
      <div className={STYLES.cardContent}>
        <div className={STYLES.header}>
          <div className={STYLES.user.container}>
            <div className="flex items-center gap-2">
              <span className={STYLES.user.avatar.container}>
                {review.photo_url ? (
                  <Image
                    src={review.photo_url}
                    alt={review.user_name || 'Avatar'}
                    width={32}
                    height={32}
                    className={STYLES.user.avatar.image}
                  />
                ) : (
                  <svg className={STYLES.user.avatar.icon} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </span>
              <span className={STYLES.user.name}>{review.user_name || 'Usuario'}</span>
            </div>
            {!isEditing && (
              <span className="flex items-center">
                <StarDisplay value={Number(review.rating)} />
              </span>
            )}
          </div>
          <div className={STYLES.rightSection.container}>
            {isUserReview && !isEditing && (
              <div className={STYLES.actions.container}>
                <button
                  onClick={() => onEditClick(review)}
                  className={STYLES.edit.button}
                  title="Editar reseña"
                  disabled={isDeleting}
                >
                  <FiEdit2 className={STYLES.edit.icon} />
                </button>
                <button
                  onClick={() => onDelete(review)}
                  className={STYLES.delete.button}
                  title="Eliminar reseña"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <FiLoader className={STYLES.delete.icon} />
                  ) : (
                    <FaTrash className={STYLES.delete.icon} />
                  )}
                </button>
              </div>
            )}
            <span className={STYLES.user.date}>
              {review.created_at && new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        {isEditing ? (
          <ReviewEditForm
            editText={review.review}
            editRating={Number(review.rating)}
            onSave={onSave}
            onCancel={onCancel}
          />
        ) : (
          <p className={STYLES.content.text}>
            {review.review}
          </p>
        )}
      </div>
    </div>
  );
}; 
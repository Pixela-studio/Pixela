import { useCallback, useState } from "react";
import { reviewsAPI } from "@/api/reviews/reviews";
import type { Review } from "@/api/reviews/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import {
  FiLoader,
  FiAlertCircle,
  FiStar,
  FiEdit,
  FiCheck,
  FiX,
} from "react-icons/fi";
import { FaTrash } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { StarEditProps } from "@/features/profile/types/layout";
import { EmptyState } from "@/shared/components/EmptyState";

/**
 * URL base para las imágenes de TMDB
 */
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

/**
 * Mensajes de error constantes
 */
const ERROR_MESSAGES = {
  LOAD: "No se pudieron cargar las reseñas.",
  DELETE: "No se pudo eliminar la reseña",
  UPDATE: "No se pudo actualizar la reseña",
} as const;

// ... imports remain the same

/**
 * Componente para mostrar y editar medias estrellas
 * @param {StarEditProps} props - Props del componente
 * @returns {JSX.Element} Componente StarEdit
 */
const StarEdit = ({ value, onChange, disabled }: StarEditProps) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => {
      const starValue = star * 2;
      const isFull = value >= starValue;
      const isHalf = value === starValue - 1;
      return (
        <span key={star} className="relative w-6 h-6 group">
          <button
            type="button"
            aria-label={`Puntuar con ${star - 0.5} estrellas`}
            className={clsx(
              "absolute top-0 left-0 z-10 w-1/2 h-full",
              disabled ? "cursor-not-allowed" : "cursor-pointer",
            )}
            onClick={() => !disabled && onChange(star * 2 - 1)}
            disabled={disabled}
          />
          <button
            type="button"
            aria-label={`Puntuar con ${star} estrellas`}
            className={clsx(
              "absolute top-0 right-0 z-10 w-1/2 h-full",
              disabled ? "cursor-not-allowed" : "cursor-pointer",
            )}
            onClick={() => !disabled && onChange(star * 2)}
            disabled={disabled}
          />
          <span className="relative inline-block w-6 h-6">
            <FiStar
              className={`w-6 h-6 absolute top-0 left-0 ${isFull ? "text-yellow-400" : "text-gray-400"}`}
            />
            {isHalf && (
              <FiStar
                className="absolute top-0 left-0 w-6 h-6 text-yellow-400"
                style={{ clipPath: "inset(0 50% 0 0)" }}
              />
            )}
          </span>
        </span>
      );
    })}
    <span className="ml-2 text-xs text-yellow-400">
      {(value / 2) % 1 === 0 ? value / 2 : (value / 2).toFixed(1)}/5
    </span>
  </div>
);

interface ProfileReviewsProps {
  onStatsUpdate?: () => void;
}

const EMPTY_REVIEWS: Review[] = [];

export const ProfileReviews = ({ onStatsUpdate }: ProfileReviewsProps) => {
  const fetchReviews = useCallback(() => reviewsAPI.list(), []);
  const {
    data: reviews,
    loading,
    error,
    reload: reloadReviews,
    setData: setReviews,
    setError,
  } = useAsyncResource(fetchReviews, EMPTY_REVIEWS, {
    errorMessage: ERROR_MESSAGES.LOAD,
    label: "reviews",
  });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");
  const [editRating, setEditRating] = useState<number>(5);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (reviewId: number) => {
    setDeletingId(reviewId);
    try {
      await reviewsAPI.delete(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      onStatsUpdate?.();
    } catch {
      setError(ERROR_MESSAGES.DELETE);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setEditText(review.review);
    setEditRating(Number(review.rating));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditRating(5);
  };

  const handleSaveEdit = async (review: Review) => {
    setSavingId(review.id);
    try {
      await reviewsAPI.update({
        ...review,
        review: editText,
        rating: editRating,
      });
      await reloadReviews();
      onStatsUpdate?.();
      setEditingId(null);
      setEditText("");
      setEditRating(5);
    } catch {
      setError(ERROR_MESSAGES.UPDATE);
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FiLoader className="w-8 h-8 text-pixela-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <FiAlertCircle className="w-6 h-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={<FiStar />}
        title="Aún no has escrito ninguna reseña"
        description="Puntúa una película o serie desde su ficha y cuenta qué te pareció. Tus reseñas aparecerán aquí."
        action={{ label: "Buscar algo que reseñar", href: "/categories" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/5 flex gap-4 transition-all hover:bg-white/10 hover:border-white/10 group"
        >
          {/* Poster Image */}
          <Link
            href={`/${review.item_type === "movie" ? "movies" : "series"}/${review.tmdb_id}`}
            className="flex-shrink-0 w-24 h-36 relative rounded-lg overflow-hidden shadow-lg transition-transform group-hover:scale-105"
          >
            {review.poster_path ? (
              <Image
                src={`${TMDB_IMAGE_BASE_URL}${review.poster_path}`}
                alt={
                  review.title ||
                  (review.item_type === "movie" ? "Película" : "Serie")
                }
                fill
                className="object-cover"
                sizes="100px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs text-center p-2">
                Sin imagen
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          </Link>

          {/* Content */}
          <div className="flex flex-col flex-grow min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Link
                  href={`/${review.item_type === "movie" ? "movies" : "series"}/${review.tmdb_id}`}
                  className="text-white font-bold text-lg hover:text-pixela-accent transition-colors line-clamp-1"
                >
                  {review.title ||
                    `${review.item_type === "movie" ? "Película" : "Serie"} #${review.tmdb_id}`}
                </Link>
                <p className="text-xs text-gray-400">
                  {review.created_at
                    ? new Date(review.created_at).toLocaleDateString()
                    : ""}
                </p>
              </div>

              {/* Actions */}
              {editingId !== review.id && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                    title="Editar reseña"
                    onClick={() => handleEdit(review)}
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Eliminar reseña"
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                  >
                    {deletingId === review.id ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FaTrash className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="mb-3">
              {editingId === review.id ? (
                <StarEdit
                  value={editRating}
                  onChange={setEditRating}
                  disabled={savingId === review.id}
                />
              ) : (
                <div className="flex items-center text-yellow-400 gap-1">
                  <FiStar className="fill-current w-4 h-4" />
                  <span className="font-bold">
                    {Number(review.rating) % 1 === 0
                      ? Number(review.rating) / 2
                      : (Number(review.rating) / 2).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">/ 5</span>
                </div>
              )}
            </div>

            {/* Review Text / Edit Form */}
            <div className="flex-grow">
              {editingId === review.id ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white resize-none focus:border-pixela-accent focus:outline-none"
                    rows={3}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    disabled={savingId === review.id}
                    placeholder="Escribe tu reseña aquí..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-3 py-1.5 bg-red-500/10 text-red-500 text-xs rounded hover:bg-red-500/20 transition-colors flex items-center gap-1"
                      onClick={handleCancelEdit}
                      disabled={savingId === review.id}
                    >
                      <FiX className="w-3 h-3" /> Cancelar
                    </button>
                    <button
                      className="px-3 py-1.5 bg-green-500/10 text-green-500 text-xs rounded hover:bg-green-500/20 transition-colors flex items-center gap-1"
                      onClick={() => handleSaveEdit(review)}
                      disabled={savingId === review.id}
                    >
                      {savingId === review.id ? (
                        <FiLoader className="w-3 h-3 animate-spin" />
                      ) : (
                        <FiCheck className="w-3 h-3" />
                      )}{" "}
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                  {review.review}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

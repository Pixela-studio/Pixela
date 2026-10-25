import { useCallback, useId, useState } from "react";
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
import { EmptyState } from "@/shared/components/EmptyState";
import { StarRatingInput } from "@/shared/components/StarRatingInput";
import { toast } from "@/lib/toast";

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

/**
 * A partir de esta longitud la reseña se recorta a tres líneas con "Leer más".
 * Heurística: unas tres líneas de la tarjeta, o menos si trae saltos de línea.
 */
const LONG_REVIEW_CHARS = 220;
const isLongReview = (text: string) =>
  text.length > LONG_REVIEW_CHARS || text.split("\n").length > 3;

/** Texto de una reseña con saltos de párrafo y "Leer más" si es largo. */
const ReviewText = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false);
  const textId = useId();
  const long = isLongReview(text);

  return (
    <div>
      <p
        id={textId}
        className={`text-gray-300 text-sm leading-relaxed whitespace-pre-line ${long && !expanded ? "line-clamp-3" : ""}`}
      >
        {text}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={textId}
          className="mt-1 rounded-sm text-sm font-medium text-pixela-accent underline-offset-4 hover:underline"
        >
          {expanded ? "Leer menos" : "Leer más"}
        </button>
      )}
    </div>
  );
};

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
  const [editRating, setEditRating] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /**
   * Borra con margen para deshacer: la tarjeta sale de la lista al instante y
   * el DELETE solo se envía cuando el aviso se cierra sin pulsar "Deshacer".
   */
  const handleDelete = (review: Review) => {
    let removedIndex = -1;
    setReviews((prev) => {
      removedIndex = prev.findIndex((r) => r.id === review.id);
      return prev.filter((r) => r.id !== review.id);
    });

    // Devuelve la reseña a su sitio (deshacer o fallo del DELETE).
    const restore = () =>
      setReviews((prev) => {
        if (prev.some((r) => r.id === review.id)) return prev;
        const next = [...prev];
        next.splice(removedIndex < 0 ? next.length : Math.min(removedIndex, next.length), 0, review);
        return next;
      });

    const reviewTitle = review.title ? ` de «${review.title}»` : "";
    toast.undoable({
      title: "Reseña borrada",
      message: `Tu reseña${reviewTitle} se ha borrado.`,
      onUndo: restore,
      onCommit: async () => {
        setDeletingId(review.id);
        try {
          await reviewsAPI.delete(review.id);
          onStatsUpdate?.();
        } catch {
          restore();
          toast.error(ERROR_MESSAGES.DELETE, { title: "Error" });
        } finally {
          setDeletingId(null);
        }
      },
    });
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setEditText(review.review);
    setEditRating(Number(review.rating));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
    setEditRating(null);
  };

  const handleSaveEdit = async (review: Review) => {
    if (editRating === null) return;
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
      setEditRating(null);
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
      <div role="alert" className="flex items-center justify-center p-8 text-red-400">
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
          className="bg-white/5 rounded-2xl p-4 border border-white/5 flex gap-4 transition-colors duration-200 hover:bg-white/10 hover:border-white/10 group"
        >
          {/* Poster Image */}
          <Link
            href={`/${review.item_type === "movie" ? "movies" : "series"}/${review.tmdb_id}`}
            className="flex-shrink-0 w-24 h-36 relative rounded-lg overflow-hidden shadow-lg transition-transform group-hover:scale-105"
            prefetch={false}
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
              <div className="w-full h-full flex items-center justify-center bg-pixela-raised text-gray-400 text-xs text-center p-2">
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
                  prefetch={false}
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

              {/* Actions: visibles al pasar el ratón, al tabular hasta ellas
                  y siempre en pantallas táctiles, donde no hay hover. */}
              {editingId !== review.id && (
                <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100">
                  <button
                    type="button"
                    className="rounded-full p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-200"
                    aria-label={`Editar tu reseña${review.title ? ` de «${review.title}»` : ""}`}
                    title="Editar reseña"
                    onClick={() => handleEdit(review)}
                  >
                    <FiEdit className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="rounded-full p-2 text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200"
                    aria-label={`Borrar tu reseña${review.title ? ` de «${review.title}»` : ""}`}
                    title="Borrar reseña"
                    onClick={() => handleDelete(review)}
                    disabled={deletingId === review.id}
                  >
                    {deletingId === review.id ? (
                      <FiLoader className="w-4 h-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <FaTrash className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="mb-3">
              {editingId === review.id ? (
                <StarRatingInput
                  value={editRating}
                  onChange={setEditRating}
                  label="Puntuación"
                  size="sm"
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
                  <span className="text-xs text-gray-400">/ 5</span>
                </div>
              )}
            </div>

            {/* Review Text / Edit Form */}
            <div className="flex-grow">
              {editingId === review.id ? (
                <div className="flex flex-col gap-2">
                  <label htmlFor={`review-${review.id}-text`} className="sr-only">
                    Texto de la reseña
                  </label>
                  <textarea
                    id={`review-${review.id}-text`}
                    className="w-full bg-pixela-surface border border-white/10 rounded-2xl p-3 text-sm text-white placeholder:text-white/40 resize-none hover:border-white/20 focus:border-pixela-accent/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent/30 transition-[border-color,box-shadow] duration-200 ease-out-expo"
                    rows={3}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    disabled={savingId === review.id}
                    placeholder="Escribe tu reseña aquí..."
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={handleCancelEdit}
                      disabled={savingId === review.id}
                    >
                      <FiX className="w-4 h-4" aria-hidden="true" /> Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSaveEdit(review)}
                      disabled={savingId === review.id || editRating === null}
                    >
                      {savingId === review.id ? (
                        <FiLoader className="w-4 h-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <FiCheck className="w-4 h-4" aria-hidden="true" />
                      )}
                      Guardar
                    </button>
                  </div>
                </div>
              ) : (
                review.review && <ReviewText text={review.review} />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

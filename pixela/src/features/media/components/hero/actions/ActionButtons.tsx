"use client";

import { FaBookmark, FaPen } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { ReviewModal } from "@/features/media/components/review/ReviewModal";
import { ActionButtonsProps } from "@/features/media/types/actions";
import { toast } from "@/lib/toast";
import { LibraryButton } from "@/features/media/components/actions/LibraryButton";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";

/*
 * Jerarquía de la fila de acciones.
 *
 * Antes los tres controles tenían el mismo peso visual —tres rectángulos del
 * mismo tamaño y color— así que nada indicaba cuál es la acción principal. Las
 * fichas de Netflix y Prime Video resuelven esto con un único botón relleno
 * seguido de acciones secundarias en icono circular. Aquí la acción principal
 * es guardar en la biblioteca (`LibraryButton`); favorito y reseña quedan como
 * secundarias.
 */
const SECONDARY_BUTTON =
  "flex h-12 w-12 items-center justify-center rounded-full border transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F0F] disabled:cursor-not-allowed disabled:opacity-60";

const STYLES = {
  container: "flex flex-wrap items-center justify-center gap-3 lg:justify-start",
  favoriteButton: (isFavorited: boolean) =>
    `${SECONDARY_BUTTON} ${
      isFavorited
        ? "border-white/20 bg-pixela-accent text-white hover:bg-pixela-accent/90"
        : "border-white/15 bg-white/10 text-white hover:bg-white/20"
    }`,
  bookmarkIcon: "h-5 w-5 transition-all duration-300",
  reviewButton: `${SECONDARY_BUTTON} border-white/15 bg-white/10 text-white hover:bg-white/20`,
  penIcon: "h-5 w-5",
};

/**
 * Botones de acción de la ficha de una película o serie.
 *
 * El estado de favorito lo gestiona `useFavoriteToggle`, compartido con las
 * tarjetas de los carruseles.
 */
export const ActionButtons = ({
  tmdbId,
  itemType,
  title,
  refreshReviews,
}: ActionButtonsProps) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  const { isFavorited, isLoading, toggleFavorite } = useFavoriteToggle({
    tmdbId,
    itemType,
  });

  const handleReview = () => {
    if (!isAuthenticated) {
      toast.info("Inicia sesión para escribir una reseña", {
        title: "Autenticación requerida",
        duration: 3000,
      });
      router.push("/login");
      return;
    }
    setShowReviewModal(true);
  };

  const favoriteLabel = isFavorited
    ? "Quitar de favoritos"
    : "Agregar a favoritos";

  return (
    <>
      <div className={STYLES.container}>
        {/* Acción principal: guardar en la biblioteca. */}
        <LibraryButton tmdbId={tmdbId} itemType={itemType} title={title} />

        <button
          type="button"
          onClick={() => void toggleFavorite()}
          disabled={isLoading}
          className={STYLES.favoriteButton(Boolean(isFavorited))}
          aria-label={favoriteLabel}
          aria-pressed={Boolean(isFavorited)}
          title={favoriteLabel}
        >
          <FaBookmark aria-hidden="true" className={STYLES.bookmarkIcon} />
        </button>

        <button
          onClick={handleReview}
          className={STYLES.reviewButton}
          type="button"
          aria-label={`Escribir una reseña de «${title}»`}
          title="Escribir una reseña"
        >
          <FaPen aria-hidden="true" className={STYLES.penIcon} />
        </button>
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        tmdbId={tmdbId}
        itemType={itemType}
        title={title}
        refreshReviews={refreshReviews}
      />
    </>
  );
};

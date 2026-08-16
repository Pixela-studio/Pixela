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

const STYLES = {
  container: "flex gap-4",
  favoriteButton: (isFavorited: boolean, isLoading: boolean) =>
    `p-3 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-lg ${isFavorited ? "bg-[#FF2D55] text-white border border-white/20 hover:bg-[#FF4A6B]" : "bg-[#FF2D55]/10 text-[#FF2D55] border border-[#FF2D55]/40 hover:bg-[#FF2D55]/20"} ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`,
  bookmarkIcon: (isFavorited: boolean) =>
    `w-5 h-5 transition-all duration-300 ${isFavorited ? "" : "drop-shadow-[0_0_8px_rgba(255,45,85,0.5)] scale-110"}`,
  reviewButton:
    "bg-[#1A1A1A] hover:bg-[#252525] text-white px-8 py-3 rounded-lg font-medium transition duration-300 flex items-center gap-2 border border-white/10",
  penIcon: "w-5 h-5",
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
        <button
          type="button"
          onClick={() => void toggleFavorite()}
          disabled={isLoading}
          className={STYLES.favoriteButton(Boolean(isFavorited), isLoading)}
          aria-label={favoriteLabel}
          aria-pressed={Boolean(isFavorited)}
          title={favoriteLabel}
        >
          <FaBookmark
            aria-hidden="true"
            className={STYLES.bookmarkIcon(Boolean(isFavorited))}
          />
        </button>
        <button
          onClick={handleReview}
          className={STYLES.reviewButton}
          type="button"
        >
          <FaPen aria-hidden="true" className={STYLES.penIcon} />
          Hacer Reseña
        </button>
        <LibraryButton tmdbId={tmdbId} itemType={itemType} title={title} />
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

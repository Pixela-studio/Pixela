"use client";

import { FaBookmark, FaPen } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { favoritesAPI } from "@/api/favorites/favorites";
import { ReviewModal } from "@/features/media/components/review/ReviewModal";
import { ActionButtonsProps } from "@/features/media/types/actions";
import { toast } from "@/lib/toast";
import { LibraryButton } from "@/features/media/components/actions/LibraryButton";

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
 * Componente que muestra los botones de acción para una película o serie
 * @param {ActionButtonsProps} props - Propiedades del componente
 * @param {number} props.tmdbId - ID de la película o serie
 * @param {'movie' | 'series'} props.itemType - Tipo de película o serie
 * @param {string} props.title - Título de la película o serie
 * @param {() => void} [props.refreshReviews] - Función para refrescar las reseñas
 * @returns {JSX.Element} Componente de botones de acción
 */
export const ActionButtons = ({
  tmdbId,
  itemType,
  title,
  refreshReviews,
}: ActionButtonsProps) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();

  /**
   * Efecto para verificar el estado de favoritos
   * @returns {void}
   */
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated) return;

      try {
        const favorites = await favoritesAPI.listWithDetails();
        const fav = favorites.find(
          (fav) => fav.tmdb_id === tmdbId && fav.item_type === itemType,
        );
        setIsFavorited(!!fav);
        setFavoriteId(fav ? fav.id : null);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Error checking favorite status:", error);
        }
      }
    };

    checkFavoriteStatus();
  }, [isAuthenticated, tmdbId, itemType]);

  /**
   * Maneja el evento de agregar o eliminar un favorito
   * @returns {Promise<void>}
   */
  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info("Inicia sesión para agregar a favoritos", {
        title: "Autenticación requerida",
        duration: 3000,
      });
      router.push("/login");
      return;
    }

    /**
     * Establece el estado de carga y maneja el evento de agregar o eliminar un favorito
     * @returns {Promise<void>}
     */
    setIsLoading(true);
    try {
      if (isFavorited && favoriteId) {
        await favoritesAPI.deleteFavorite(favoriteId);
      } else {
        await favoritesAPI.addFavorite({
          tmdb_id: tmdbId,
          item_type: itemType,
        });
      }

      // Refresca el estado real desde la API
      const favorites = await favoritesAPI.listWithDetails();
      const fav = favorites.find(
        (fav) => fav.tmdb_id === tmdbId && fav.item_type === itemType,
      );
      setIsFavorited(!!fav);
      setFavoriteId(fav ? fav.id : null);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error toggling favorite:", error);
      }
      if (error instanceof Error && error.message.includes("401")) {
        await checkAuth();
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el evento de hacer una reseña
   * @returns {void}
   */
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

  return (
    <>
      <div className={STYLES.container}>
        <button
          onClick={handleFavorite}
          disabled={isLoading}
          className={STYLES.favoriteButton(isFavorited, isLoading)}
          aria-label={
            isFavorited ? "Quitar de favoritos" : "Agregar a favoritos"
          }
          title={isFavorited ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <FaBookmark className={STYLES.bookmarkIcon(isFavorited)} />
        </button>
        <button
          onClick={handleReview}
          className={STYLES.reviewButton}
          type="button"
        >
          <FaPen className={STYLES.penIcon} />
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

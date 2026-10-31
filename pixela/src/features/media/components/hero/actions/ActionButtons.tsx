"use client";

import { FaBookmark, FaPen } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { ReviewModal } from "@/features/media/components/review/ReviewModal";
import { ActionButtonsProps } from "@/features/media/types/actions";
import { toast } from "@/lib/toast";
import { loginHrefForHere } from "@/lib/authRedirect";
import { LibraryButton } from "@/features/media/components/actions/LibraryButton";
import { useFavoriteToggle } from "@/hooks/useFavoriteToggle";
import { ShareButton } from "@/shared/components/ShareButton";

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
// En móvil siguen siendo círculos de icono; desde `sm:` llevan una etiqueta
// corta visible, porque en la beta Carmen no entendía qué hacía cada icono.
const SECONDARY_BUTTON = "btn btn-ghost min-w-12 px-3.5 sm:px-5";

const STYLES = {
  container: "flex flex-wrap items-center justify-center gap-3 lg:justify-start",
  favoriteButton: (isFavorited: boolean) =>
    `${SECONDARY_BUTTON} ${
      // Marcado: borde encendido y el marcador en rosa, sin competir en
      // relleno con el primario de al lado.
      isFavorited ? "border-white/45 [&>svg]:text-pixela-accent" : ""
    }`,
  bookmarkIcon: "h-5 w-5 shrink-0",
  // Visible también en el móvil: solo con el icono, el marcador de favoritos
  // y «Añadir a mi lista» parecían el mismo botón.
  buttonLabel: "",
  reviewButton: SECONDARY_BUTTON,
  penIcon: "h-5 w-5 shrink-0",
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
  userReview,
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
      router.push(loginHrefForHere());
      return;
    }
    setShowReviewModal(true);
  };

  // El nombre accesible contiene el texto visible (WCAG 2.5.3) y añade la acción.
  const favoriteLabel = isFavorited
    ? "En favoritos. Quitar de favoritos"
    : "Añadir a favoritos";
  const favoriteText = isFavorited ? "En favoritos" : "Favorito";

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
          <span aria-hidden="true" className={STYLES.buttonLabel}>
            {favoriteText}
          </span>
        </button>

        <button
          onClick={handleReview}
          className={STYLES.reviewButton}
          type="button"
          aria-label={`Reseñar «${title}»`}
          title="Escribir una reseña"
        >
          <FaPen aria-hidden="true" className={STYLES.penIcon} />
          <span aria-hidden="true" className={STYLES.buttonLabel}>
            Reseñar
          </span>
        </button>

        <ShareButton title={title} className={STYLES.reviewButton} />
      </div>

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        tmdbId={tmdbId}
        itemType={itemType}
        title={title}
        refreshReviews={refreshReviews}
        existingReview={userReview}
      />
    </>
  );
};

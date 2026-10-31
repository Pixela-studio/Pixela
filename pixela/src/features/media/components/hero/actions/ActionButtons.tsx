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
import { AddToListDialog } from "@/features/lists/components/AddToListDialog";
import { FiCalendar, FiList } from "react-icons/fi";
import { LogViewingDialog } from "@/features/diary/components/LogViewingDialog";

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

  const [showListsDialog, setShowListsDialog] = useState(false);
  const [showDiaryDialog, setShowDiaryDialog] = useState(false);

  /** Abre un diálogo que necesita cuenta o manda al login con vuelta aquí. */
  const requireAccount = (message: string, open: () => void) => {
    if (!isAuthenticated) {
      toast.info(message, { title: "Autenticación requerida", duration: 3000 });
      router.push(loginHrefForHere());
      return;
    }
    open();
  };

  const handleLists = () =>
    requireAccount("Inicia sesión para guardar títulos en tus listas", () => setShowListsDialog(true));

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

        <button
          onClick={() => requireAccount("Inicia sesión para llevar tu diario", () => setShowDiaryDialog(true))}
          className={STYLES.reviewButton}
          type="button"
          aria-label={`Apuntar «${title}» en tu diario`}
        >
          <FiCalendar aria-hidden="true" className={STYLES.penIcon} />
          <span aria-hidden="true" className={STYLES.buttonLabel}>
            Lo he visto
          </span>
        </button>

        <button
          onClick={handleLists}
          className={STYLES.reviewButton}
          type="button"
          aria-label={`Añadir «${title}» a una lista`}
        >
          <FiList aria-hidden="true" className={STYLES.penIcon} />
          <span aria-hidden="true" className={STYLES.buttonLabel}>
            Listas
          </span>
        </button>

        <ShareButton title={title} className={STYLES.reviewButton} />
      </div>

      <LogViewingDialog
        isOpen={showDiaryDialog}
        onClose={() => setShowDiaryDialog(false)}
        tmdbId={tmdbId}
        itemType={itemType}
        title={title}
      />

      <AddToListDialog
        isOpen={showListsDialog}
        onClose={() => setShowListsDialog(false)}
        tmdbId={tmdbId}
        itemType={itemType}
        title={title}
      />

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

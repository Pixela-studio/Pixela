"use client";

import { Media } from "../types";
import { useCallback, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { reviewsAPI } from "@/api/reviews/reviews";
import type { Review } from "@/api/reviews/types";
import { useMediaStore } from "@/features/media/store/mediaStore";

import { HeroSection } from "@/features/media/components/hero/HeroSection";
import { PosterModal } from "@/features/media/components/hero/PosterModal";
import { StreamingProviders } from "@/features/media/components/platforms/StreamingProviders";
import { CastSection } from "@/features/media/components/cast/CastSection";
import { TrailersSection } from "@/features/media/components/trailer/TrailersSection";
import { GallerySection } from "@/features/media/components/gallery/GallerySection";
import { ReviewSection } from "@/features/media/components/review/ReviewSection";
import { TechnicalSheet } from "@/features/media/components/details/TechnicalSheet";
import { SimilarSection } from "@/features/media/components/details/SimilarSection";
import { EpisodesSection } from "@/features/media/components/episodes/EpisodesSection";
import type { Serie } from "@/features/media/types/content";

interface MediaPageProps {
  media: Media;
  /** Reseñas ya resueltas en el servidor. Ver el comentario de `reviews` abajo. */
  initialReviews: Review[];
}

/**
 * Página de media
 * @param {MediaPageProps} props - Propiedades de la página
 * @returns {JSX.Element} Página de media
 */
export const MediaPage = ({ media, initialReviews }: MediaPageProps) => {
  const tmdbId = Number(media.id);
  const itemType = media.tipo === "pelicula" ? "movie" : "series";

  /*
   * Las reseñas llegan como prop desde el Server Component y viven en estado
   * local, no en `useMediaStore`.
   *
   * Antes se pedían en un `useEffect` al montar: una Edge Request y una
   * invocación de función en **cada** vista de ficha, también para visitantes
   * anónimos. Con la página ya en ISR, esa llamada era lo único que seguía
   * despertando al servidor en cada visita.
   *
   * Estado local y no store porque `MediaPage` era el único que leía `reviews`
   * de `useMediaStore`, y un store a nivel de módulo arrastra las reseñas de la
   * ficha anterior al navegar entre títulos. Sembrar `useState` con la prop
   * evita además el `setState` en efecto que el store obligaba a hacer.
   *
   * Frescura: quien publica, edita o borra ve el cambio al instante porque
   * `refreshReviews` va contra la API. Para el resto, las rutas de mutación
   * llaman a `revalidatePath` sobre esta ficha, así que el HTML cacheado se
   * regenera en cuanto alguien cambia algo.
   */
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);

  /**
   * Estado y acciones del store
   * @type {Object}
   * @property {boolean} showPosterModal - Indica si el modal de la imagen está abierto
   * @property {() => void} setShowPosterModal - Función que se ejecuta al cerrar el modal de la imagen
   * @property {Review[]} reviews - Lista de reseñas
   * @property {boolean} loadingReviews - Indica si se está cargando las reseñas
   * @property {string | null} errorReviews - Indica si hay un error en las reseñas
   * @property {() => void} setReviews - Función que se ejecuta al actualizar las reseñas
   */
  const { showPosterModal, setShowPosterModal } = useMediaStore();

  /*
   * Reseña propia, sacada de las que ya llegaron del servidor. Se la pasamos
   * al modal para que la precargue sin pedir las reseñas otra vez al abrirse.
   * `undefined` sin sesión: el modal no se abre sin ella.
   */
  const userId = useAuthStore((state) => state.user?.user_id);
  // Si no está en la lista, puede ser «solo para mí»: el HTML cacheado de la
  // ficha no las lleva. Con `undefined` el modal la busca al abrirse en vez de
  // dar por hecho que no hay ninguna (y sobrescribirla al guardar).
  const userReview = useMemo(
    () => (userId ? reviews.find((review) => review.user_id === userId) : undefined),
    [reviews, userId],
  );

  /**
   * Recarga las reseñas desde la API.
   *
   * Solo se llama tras una mutación (publicar, editar, borrar), nunca al montar.
   */
  const refreshReviews = useCallback(() => {
    setLoadingReviews(true);
    setErrorReviews(null);
    reviewsAPI
      .getByMedia(tmdbId, itemType)
      .then((data) => {
        setReviews(data);
      })
      .catch(() => setErrorReviews("No se pudieron cargar las reseñas."))
      .finally(() => setLoadingReviews(false));
  }, [tmdbId, itemType]);

  return (
    <div className="min-h-screen bg-pixela-ink">
      {/* Hero Section */}
      <HeroSection
        media={media}
        onPosterClick={() => setShowPosterModal(true)}
        title={media.titulo}
        refreshReviews={refreshReviews}
        userReview={userReview}
      />

      {/* Poster Modal */}
      <PosterModal
        isOpen={showPosterModal}
        onClose={() => setShowPosterModal(false)}
        posterUrl={media.poster}
        title={media.titulo}
      />

      {/* Content Sections */}
      <div className="relative z-10 pb-40">
        <div className="w-full px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 flex flex-col gap-16 md:gap-24">
          {/* Proveedores de Streaming */}
          <StreamingProviders
            providers={media.proveedores || []}
            watchUrl={media.proveedoresUrl}
          />
          {/* Temporadas y capítulos vistos */}
          {media.tipo === "serie" && <EpisodesSection serie={media as Serie} />}
          {/* Reparto */}
          <CastSection actors={media.actores} />
          {/* Trailers */}
          <TrailersSection trailers={media.trailers} />
          {/* Galería */}
          <GallerySection media={media} />
          {/* Ficha técnica */}
          <TechnicalSheet media={media} />
          {/* Similares */}
          <SimilarSection items={media.similares ?? []} />
          {/* Reseñas */}
          <ReviewSection
            tmdbId={tmdbId}
            itemType={itemType}
            reviews={reviews}
            mediaTitle={media.titulo}
            loading={loadingReviews}
            error={errorReviews}
            refreshReviews={refreshReviews}
          />
        </div>
      </div>
    </div>
  );
};

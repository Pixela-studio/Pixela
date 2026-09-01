"use client";

import { Media } from "../types";
import { useCallback, useState } from "react";
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
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Hero Section */}
      <HeroSection
        media={media}
        onPosterClick={() => setShowPosterModal(true)}
        title={media.titulo}
        refreshReviews={refreshReviews}
      />

      {/* Poster Modal */}
      <PosterModal
        isOpen={showPosterModal}
        onClose={() => setShowPosterModal(false)}
        posterUrl={media.poster}
        title={media.titulo}
      />

      {/* Content Sections */}
      <div className="relative z-10 pb-40 -mt-20">
        <div className="container px-4 pt-8 mx-auto md:pt-0">
          {/* Proveedores de Streaming */}
          <StreamingProviders providers={media.proveedores || []} />
          {/* Reparto */}
          <CastSection actors={media.actores} />
          {/* Trailers */}
          <TrailersSection trailers={media.trailers} />
          {/* Galería */}
          <GallerySection media={media} />
          {/* Reseñas */}
          <ReviewSection
            tmdbId={tmdbId}
            itemType={itemType}
            reviews={reviews}
            loading={loadingReviews}
            error={errorReviews}
            refreshReviews={refreshReviews}
          />
        </div>
      </div>
    </div>
  );
};

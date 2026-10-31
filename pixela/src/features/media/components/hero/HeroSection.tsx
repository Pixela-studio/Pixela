"use client";

import { Media } from '../../types';
import type { Review } from '@/api/reviews/types';
import { BackdropImage } from './backdrop/BackdropImage';
import { MediaPoster } from './poster/MediaPoster';
import { MediaTitle } from './title/MediaTitle';
import { GenresList } from './genres/GenresList';
import { MediaMetadata } from './metadata/MediaMetadata';
import { CreatorInfo } from './creators/CreatorInfo';
import { ActionButtons } from './actions/ActionButtons';

interface HeroSectionProps {
  media: Media;
  onPosterClick: () => void;
  title: string;
  refreshReviews?: () => void;
  /** Reseña del usuario en este título; ver `ReviewModal`. */
  userReview?: Review | null;
}

const STYLES = {
  // La ficha como cartón de apertura: backdrop a sangre, el título en Bodoni
  // a escala de cartel y los créditos debajo, todo alineado a la izquierda.
  container: "relative w-full min-h-[88vh] flex items-end",
  contentWrapper:
    "relative w-full px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 pt-[34vh] pb-14 lg:pb-20",
  layout: "flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:gap-14",
  poster: "w-32 flex-shrink-0 sm:w-44 lg:w-64 xl:w-72",
  content: "flex w-full min-w-0 flex-col items-start gap-5",
  synopsis:
    "max-w-2xl text-lg leading-relaxed text-white/85 lg:text-xl [text-wrap:pretty]",
} as const;

/**
 * Cabecera de la ficha de una película o serie.
 *
 * Antes existían dos árboles JSX completos —uno con `lg:hidden` y otro con
 * `hidden lg:flex`— que renderizaban los mismos seis componentes. Eso
 * significaba dos `<h1>` con el mismo título en el documento, contenido
 * duplicado en el árbol de accesibilidad y el doble de trabajo de render en
 * todos los tamaños de pantalla; además, cualquier cambio había que hacerlo
 * dos veces o las dos vistas se desincronizaban. Ahora es un único layout que
 * cambia de dirección con utilidades responsive.
 */
export function HeroSection({ media, onPosterClick, title, refreshReviews, userReview }: HeroSectionProps) {
  const itemType = media.tipo === 'pelicula' ? 'movie' : 'series';

  return (
    <header className={STYLES.container}>
      <BackdropImage backdropUrl={media.backdrop} />

      <div className={STYLES.contentWrapper}>
        <div className={STYLES.layout}>
          <MediaPoster
            posterUrl={media.poster}
            title={media.titulo}
            onClick={onPosterClick}
            className={STYLES.poster}
            type={itemType}
          />

          <div className={STYLES.content}>
            <MediaTitle title={media.titulo} originalTitle={media.tituloOriginal} />
            <MediaMetadata media={media} />
            <GenresList genres={media.generos} />
            <CreatorInfo media={media} />

            <p className={STYLES.synopsis}>{media.sinopsis}</p>

            <ActionButtons
              tmdbId={Number(media.id)}
              itemType={itemType}
              title={title}
              refreshReviews={refreshReviews}
              userReview={userReview}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

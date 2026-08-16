"use client";

import { Media } from '../../types';
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
}

const STYLES = {
  container: "relative w-full min-h-[80vh] flex items-end",
  contentWrapper: "relative container mx-auto px-4 pt-32 pb-12 lg:pt-40 lg:pb-20",
  layout:
    "flex flex-col items-center gap-8 text-center lg:flex-row lg:items-end lg:gap-10 lg:text-left",
  poster: "w-40 flex-shrink-0 sm:w-48 lg:w-64",
  content: "flex w-full flex-col items-center gap-4 lg:items-start",
  synopsis:
    "max-w-3xl text-base leading-relaxed text-gray-300 lg:text-lg [text-wrap:pretty]",
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
export function HeroSection({ media, onPosterClick, title, refreshReviews }: HeroSectionProps) {
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
            <MediaTitle title={media.titulo} />
            <MediaMetadata media={media} />
            <GenresList genres={media.generos} />
            <CreatorInfo media={media} />

            <p className={STYLES.synopsis}>{media.sinopsis}</p>

            <ActionButtons
              tmdbId={Number(media.id)}
              itemType={itemType}
              title={title}
              refreshReviews={refreshReviews}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

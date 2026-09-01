"use client";

import Image from 'next/image';
import clsx from 'clsx';
import { useState, memo } from 'react';
import { FiMaximize2 } from 'react-icons/fi';

const STYLES = {
  container: 'flex-shrink-0',
  button:
    'group relative block w-full cursor-zoom-in rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pixela-accent focus-visible:ring-offset-4 focus-visible:ring-offset-[#0F0F0F]',
  imageContainer: 'relative w-full aspect-[2/3] overflow-hidden rounded-lg shadow-2xl shadow-black/50',
  image: 'object-cover transition duration-300 group-hover:scale-105',
  hoverOverlay:
    'absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-black/50 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100',
  placeholderContainer: 'absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex flex-col items-center justify-center p-4 text-center rounded-lg',
  placeholderEmoji: 'text-4xl mb-3 opacity-50',
  placeholderTitle: 'text-white text-sm font-medium leading-tight mb-2 line-clamp-3',
  placeholderNoImage: 'text-xs text-gray-400 opacity-75',
  placeholderOverlay: 'absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none'
} as const;

interface MediaPosterProps {
  posterUrl: string;
  title: string;
  /** Sin handler el póster se pinta como imagen decorativa, no como control. */
  onClick?: () => void;
  className?: string;
  type?: 'movie' | 'series' | 'person';
}

/**
 * Componente placeholder cuando no hay imagen disponible
 */
const PlaceholderPoster = memo(({ title, type = 'movie' }: { title: string, type?: 'movie' | 'series' | 'person' }) => (
  <div className={STYLES.placeholderContainer}>
    <div className={STYLES.placeholderEmoji} aria-hidden="true">
      {type === 'movie' ? '🎬' : type === 'series' ? '📺' : '👤'}
    </div>
    <p className={STYLES.placeholderTitle}>{title}</p>
    <div className={STYLES.placeholderNoImage}>
      Sin imagen disponible
    </div>
    <div className={STYLES.placeholderOverlay} />
  </div>
));

PlaceholderPoster.displayName = 'PlaceholderPoster';

/**
 * Póster de la ficha, ampliable en un modal.
 *
 * El disparador era un `<div onClick>`: no aparecía en el orden de tabulación,
 * no respondía a Enter ni Espacio y no anunciaba nada a un lector de pantalla,
 * de modo que ampliar el póster era imposible sin ratón. Ahora es un `<button>`
 * real con etiqueta accesible y anillo de foco.
 */
export const MediaPoster = ({ posterUrl, title, onClick, className, type = 'movie' }: MediaPosterProps) => {
  const [imageError, setImageError] = useState(false);
  const hasImage = Boolean(posterUrl?.trim()) && !imageError;

  const artwork = (
    <div className={STYLES.imageContainer}>
      {hasImage ? (
        <Image
          src={posterUrl}
          alt={onClick ? '' : title}
          className={STYLES.image}
          fill
          sizes="(max-width: 640px) 160px, (max-width: 1024px) 192px, 256px"
          priority
          onError={() => setImageError(true)}
        />
      ) : (
        <PlaceholderPoster title={title} type={type} />
      )}

      {onClick && (
        <span className={STYLES.hoverOverlay} aria-hidden="true">
          <FiMaximize2 className="h-4 w-4" />
          Ampliar
        </span>
      )}
    </div>
  );

  // Sin `onClick` no hay nada que activar: renderizar igualmente un `<button>`
  // metería en el orden de tabulación un control que no hace nada.
  if (!onClick) {
    return <div className={clsx(STYLES.container, className)}>{artwork}</div>;
  }

  return (
    <div className={clsx(STYLES.container, className)}>
      <button
        type="button"
        onClick={onClick}
        className={STYLES.button}
        aria-label={`Ampliar el póster de «${title}»`}
      >
        {artwork}
      </button>
    </div>
  );
};

"use client";

import Image from 'next/image';
import clsx from 'clsx';
import { useState, memo } from 'react';

const STYLES = {
  container: 'w-64 flex-shrink-0',
  posterWrapper: 'relative group cursor-pointer',
  imageContainer: 'relative w-full aspect-[2/3]',
  image: 'rounded-lg shadow-2xl shadow-black/50 transition duration-300 group-hover:scale-105',
  hoverOverlay: 'absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center',
  hoverText: 'text-white text-sm font-medium',
  placeholderContainer: 'absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black flex flex-col items-center justify-center p-4 text-center rounded-lg',
  placeholderEmoji: 'text-4xl mb-3 opacity-50',
  placeholderTitle: 'text-white text-sm font-medium leading-tight mb-2 line-clamp-3',
  placeholderNoImage: 'text-xs text-gray-400 opacity-75',
  placeholderOverlay: 'absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none'
} as const;

interface MediaPosterProps {
  posterUrl: string;
  title: string;
  onClick: () => void;
  className?: string;
  type?: 'movie' | 'series' | 'person';
}

/**
 * Componente placeholder cuando no hay imagen disponible
 */
const PlaceholderPoster = memo(({ title, type = 'movie' }: { title: string, type?: 'movie' | 'series' | 'person' }) => (
  <div className={STYLES.placeholderContainer}>
    <div className={STYLES.placeholderEmoji}>
      {type === 'movie' ? '🎬' : type === 'series' ? '📺' : '👤'}
    </div>
    <h3 className={STYLES.placeholderTitle}>
      {title}
    </h3>
    <div className={STYLES.placeholderNoImage}>
      Sin imagen disponible
    </div>
    <div className={STYLES.placeholderOverlay} />
  </div>
));

PlaceholderPoster.displayName = 'PlaceholderPoster';

export const MediaPoster = ({ posterUrl, title, onClick, className, type = 'movie' }: MediaPosterProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={clsx(STYLES.container, className)}>
      <div 
        className={STYLES.posterWrapper}
        onClick={onClick}
      >
        <div className={STYLES.imageContainer}>
          {!posterUrl || posterUrl.trim() === '' || imageError ? (
            <PlaceholderPoster title={title} type={type} />
          ) : (
            <Image 
              src={posterUrl} 
              alt={title}
              className={STYLES.image}
              fill
              sizes="(max-width: 768px) 100vw, 256px"
              priority
              style={{objectFit: 'cover'}}
              onError={() => setImageError(true)}
            />
          )}
        </div>
        <div className={STYLES.hoverOverlay}>
          <span className={STYLES.hoverText}>Ampliar</span>
        </div>
      </div>
    </div>
  );
}; 
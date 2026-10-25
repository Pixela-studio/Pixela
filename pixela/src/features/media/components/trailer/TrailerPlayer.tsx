import React from 'react';
import { TrailerPlayerProps } from '@/features/media/types/trailer';

/**
 * Componente que muestra el player de un trailer
 * @param {TrailerPlayerProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de player de trailer
 */
export function TrailerPlayer({ trailerId }: TrailerPlayerProps) {
  if (!trailerId) return null;
  
  return (
    <div className="w-full aspect-video overflow-hidden rounded-sm bg-pixela-surface lg:col-span-2">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${trailerId}?autoplay=0&rel=0`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
} 
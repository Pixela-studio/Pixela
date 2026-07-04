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
    <div className="lg:w-2/3 w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-[#181818]/95 to-[#1a1a1a]/95 border border-white/5 shadow-2xl shadow-pixela-accent/5">
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
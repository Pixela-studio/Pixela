"use client";

import { useMediaStore } from '@/features/media/store/mediaStore';
import { TrailersSectionProps } from '@/features/media/types/trailer';
import { TrailerPlayer } from './TrailerPlayer';
import { TrailerList } from './TrailerList';  

const STYLES = {
  container: {
    base: "mt-12 mb-24",
    title: "title-card mb-8 text-5xl md:text-6xl",
    // Rejilla de tres columnas: el reproductor ocupa dos y la tercera lleva la
    // lista o, si solo hay un tráiler, su pie (así no queda un hueco a la derecha).
    content: "grid gap-6 lg:grid-cols-3",
    caption: "hidden lg:flex lg:flex-col lg:justify-end lg:pb-2",
    captionTitle: "font-semibold text-white [overflow-wrap:anywhere]",
    captionMeta: "meta-text mt-1"
  }
} as const;


/**
 * Componente que muestra la sección de trailers
 * @param {TrailersSectionProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de sección de trailers
 */
export function TrailersSection({ trailers }: TrailersSectionProps) {
  // Filtrar solo trailers de YouTube válidos
  const youtubeTrailers = trailers.filter(trailer => 
    trailer.site?.toLowerCase() === 'youtube' && 
    trailer.key
  );

  const { selectedTrailerId, setSelectedTrailerId } = useMediaStore();
  
  if (youtubeTrailers.length === 0) return null;
  
  return (
    <div className={STYLES.container.base}>
      <h2 className={STYLES.container.title}>Tráilers</h2>
      
      <div className={STYLES.container.content}>
        <TrailerPlayer trailerId={selectedTrailerId || youtubeTrailers[0]?.key || ''} />
        {youtubeTrailers.length > 1 ? (
          <TrailerList
            trailers={youtubeTrailers}
            selectedTrailerId={selectedTrailerId || youtubeTrailers[0]?.key || ''}
            onSelectTrailer={setSelectedTrailerId}
          />
        ) : (
          <div className={STYLES.container.caption}>
            <p className={STYLES.container.captionTitle}>{youtubeTrailers[0].nombre}</p>
            <p className={STYLES.container.captionMeta}>{youtubeTrailers[0].tipo || 'Tráiler'} · YouTube</p>
          </div>
        )}
      </div>
    </div>
  );
} 
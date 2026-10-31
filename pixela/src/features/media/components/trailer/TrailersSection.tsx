"use client";

import { useState } from 'react';
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
 * Sección de tráilers de la ficha.
 *
 * El vídeo elegido es estado local. Vivía en el store global de la ficha, así
 * que al pasar de una película a otra seguía seleccionado el de la anterior.
 */
export function TrailersSection({ trailers }: TrailersSectionProps) {
  const youtubeTrailers = trailers.filter(
    (trailer) => trailer.site?.toLowerCase() === 'youtube' && trailer.key,
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  if (youtubeTrailers.length === 0) return null;

  const selected =
    youtubeTrailers.find((trailer) => trailer.key === selectedKey) ?? youtubeTrailers[0];

  return (
    <div className={STYLES.container.base}>
      <h2 className={STYLES.container.title}>Tráilers</h2>

      <div className={STYLES.container.content}>
        {/* `key`: al cambiar de vídeo se vuelve a la miniatura en vez de
            arrancar otro reproductor sin que se haya pedido. */}
        <TrailerPlayer key={selected.key} trailer={selected} />
        {youtubeTrailers.length > 1 ? (
          <TrailerList
            trailers={youtubeTrailers}
            selectedTrailerId={selected.key}
            onSelectTrailer={setSelectedKey}
          />
        ) : (
          <div className={STYLES.container.caption}>
            <p className={STYLES.container.captionTitle}>{selected.nombre}</p>
            <p className={STYLES.container.captionMeta}>
              {[selected.tipo || 'Tráiler', selected.idioma].filter(Boolean).join(' · ')} · YouTube
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

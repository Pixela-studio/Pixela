"use client";

import { useState } from 'react';
import { FaPlay } from 'react-icons/fa';
import { TrailerPlayerProps } from '@/features/media/types/trailer';
import { useLiteMode } from '@/hooks/useLiteMode';

/**
 * Reproductor de tráiler con fachada.
 *
 * Antes se montaba el iframe de `www.youtube.com` en cada ficha: unos 800 KB
 * de YouTube y sus cookies de Google aunque nadie pulsara play. Ahora se pinta
 * la miniatura (`img.youtube.com`, una imagen) y el reproductor solo se carga
 * al pulsar, desde `youtube-nocookie.com`, el modo de privacidad mejorada.
 * Ahorra datos con 3G y deja la web sin cookies de terceros hasta que alguien
 * decide ver el vídeo (ver `/cookies`).
 */
export function TrailerPlayer({ trailer }: TrailerPlayerProps) {
  const [playing, setPlaying] = useState(false);
  // En modo ligero ni siquiera la miniatura: un fondo liso y el aviso de que
  // el vídeo gasta datos.
  const { lite } = useLiteMode();

  if (!trailer.key) return null;

  const label = [trailer.nombre || 'Tráiler', trailer.idioma].filter(Boolean).join(' · ');

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-sm bg-pixela-surface lg:col-span-2">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
          title={label}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex h-full w-full items-center justify-center"
          aria-label={`Reproducir ${label}`}
        >
          {/* `<img>` y no `next/image`: YouTube ya publica las variantes y el
              optimizador de Next no tiene permitido su dominio. `mqdefault`
              (320 px, ~15 KB) basta en el móvil; `maxresdefault` solo donde el
              reproductor es grande. Ambas son 16:9, sin las franjas de
              `hqdefault`, que queda de respaldo si no existe la grande. */}
          {!lite && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://img.youtube.com/vi/${trailer.key}/mqdefault.jpg`}
            srcSet={`https://img.youtube.com/vi/${trailer.key}/mqdefault.jpg 320w, https://img.youtube.com/vi/${trailer.key}/maxresdefault.jpg 1280w`}
            sizes="(min-width: 1024px) 60vw, 100vw"
            onError={(e) => {
              const img = e.currentTarget;
              img.removeAttribute('srcset');
              img.src = `https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`;
            }}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity duration-300 group-hover:opacity-100"
          />
          )}
          {lite && (
            <span className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/70">
              Modo ligero: el vídeo se carga al pulsar y consume datos.
            </span>
          )}
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-pixela-dark transition-transform duration-200 ease-out-expo group-active:scale-95 [@media(hover:hover)]:group-hover:scale-105">
            <FaPlay className="ml-1 h-5 w-5" aria-hidden="true" />
          </span>
          {trailer.idioma && (
            <span className="absolute left-3 top-3 rounded-sm bg-black/70 px-2 py-0.5 text-[13px] font-semibold text-white">
              {trailer.idioma}
            </span>
          )}
        </button>
      )}
    </div>
  );
}

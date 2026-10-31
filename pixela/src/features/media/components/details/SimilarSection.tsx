"use client";

import Image from 'next/image';
import Link from 'next/link';
import { MediaCarousel } from '@/shared/components/MediaCarousel';
import type { SimilarTitle } from '@/features/media/types/content';
import { formatYear } from '@/lib/date';

interface SimilarSectionProps {
  items: SimilarTitle[];
}

/**
 * «Si te gusta esto»: los similares que TMDB ya devolvía en el detalle (se
 * pedían en `append_to_response` y no se usaban).
 *
 * Los enlaces llevan `rel="nofollow"` y `prefetch={false}`: cada similar puede
 * ser una ficha fuera de la allowlist, y lo que se quiere es que la siga una
 * persona, no un rastreador (ver `lib/api/tmdbAllowlist.ts`).
 */
export function SimilarSection({ items }: SimilarSectionProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="similares-title">
      <h2 id="similares-title" className="title-card mb-8 text-5xl md:text-6xl">
        Si te gusta esta
      </h2>
      <div className="relative -mx-4 sm:mx-0">
        <MediaCarousel className="pb-4">
          {items.map((item) => (
            // `py-1`: hueco para el anillo de foco, que el overflow-hidden del carrusel recortaba.
            <div key={item.id} className="flex-[0_0_140px] md:flex-[0_0_160px] min-w-0 pl-4 py-1 h-full">
              <Link
                href={`/${item.tipo === 'pelicula' ? 'movies' : 'series'}/${item.id}`}
                prefetch={false}
                rel="nofollow"
                className="group flex h-full flex-col"
              >
                <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-sm bg-pixela-surface">
                  <Image
                    src={item.poster}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 140px, 160px"
                    className="object-cover transition-transform duration-700 ease-out-expo [@media(hover:hover)]:group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="line-clamp-2 text-[15px] font-semibold text-white">{item.titulo}</h3>
                <p className="mt-0.5 text-sm tabular-nums text-gray-400">
                  {[
                    formatYear(item.fecha, ''),
                    item.puntuacion ? `★ ${item.puntuacion.toFixed(1).replace('.', ',')}` : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </Link>
            </div>
          ))}
        </MediaCarousel>
      </div>
    </section>
  );
}

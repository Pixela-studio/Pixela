import type { Metadata } from 'next';
import type { Media } from '@/features/media/types';
import { formatYear } from '@/lib/date';

const DESCRIPTION_MAX = 200;

/**
 * Metadatos para compartir una ficha.
 *
 * La ficha definía su propio `openGraph` con título, descripción y póster, y
 * eso **sustituía** el del layout: se perdían `og:url`, `og:site_name`,
 * `og:locale` y `og:type`, y no había tarjeta de X. Al pegar el enlace en
 * WhatsApp salía una vista previa a medias con un póster vertical recortado.
 *
 * Ahora la vista previa lleva el backdrop horizontal (lo que esas apps
 * muestran mejor), el año, la nota y el principio de la sinopsis.
 */
export function buildMediaMetadata(media: Media, path: string): Metadata {
  const title = `${media.titulo} | Pixela`;
  const facts = [
    formatYear(media.fecha, ''),
    media.puntuacion ? `★ ${media.puntuacion.toFixed(1).replace('.', ',')}` : '',
    media.generos.slice(0, 2).join(', '),
  ].filter(Boolean);
  const synopsis = media.sinopsis.length > DESCRIPTION_MAX
    ? `${media.sinopsis.slice(0, DESCRIPTION_MAX - 1).trimEnd()}…`
    : media.sinopsis;
  const description = [facts.join(' · '), synopsis].filter(Boolean).join('. ');
  const image = media.backdrop || media.poster;
  const images = image
    ? [{ url: image, alt: `${media.titulo}${media.backdrop ? '' : ' (póster)'}` }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: media.tipo === 'pelicula' ? 'video.movie' : 'video.tv_show',
      url: path,
      siteName: 'Pixela',
      locale: 'es_ES',
      title,
      description,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images?.map((img) => img.url),
    },
  };
}

import { Metadata } from 'next';
import { getSeriesData } from './seriesService';
import { isAllowedSeries } from '@/lib/api/tmdbAllowlist';

/**
 * `noindex` para lo que no está en la allowlist del catálogo.
 * Mismo razonamiento que en `movieMetadata.ts`: quitar el índice es la mitad
 * del freno que sí se pudo aplicar, para que un buscador que ya conozca la URL
 * no la reclame periódicamente a cambio de nada. Quitar además la caché ISR
 * resultó imposible en Next 16 sin PPR; el postmortem está en
 * `src/lib/api/tmdbAllowlist.ts`.
 */
const NOINDEX = { index: false, follow: false } as const;

/**
 * Genera los metadatos para la página de series
 * @param params Parámetros de la ruta con el ID de la serie
 * @returns Objeto Metadata para Next.js
 */
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;

  try {
    /* En paralelo: no dependen entre sí y las dos suelen ser aciertos de caché. */
    const [serie, isAllowed] = await Promise.all([
      getSeriesData(id),
      isAllowedSeries(id),
    ]);

    return {
      title: `${serie.titulo} | Pixela`,
      description: serie.sinopsis,
      openGraph: {
        title: `${serie.titulo} | Pixela`,
        description: serie.sinopsis,
        images: [serie.poster],
      },
      ...(isAllowed ? {} : { robots: NOINDEX }),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error al obtener los metadatos de la serie:', error);
    }
    return {
      title: 'Serie no encontrada | Pixela',
      description: 'La serie que buscas no existe o no está disponible.',
      // Una ficha que no se ha podido resolver no tiene nada que indexar.
      robots: NOINDEX,
    };
  }
}

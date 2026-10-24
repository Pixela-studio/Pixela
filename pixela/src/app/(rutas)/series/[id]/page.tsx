import { MediaPage } from '@/features/media/pages/MediaPage';
import { notFound } from 'next/navigation';
import { getSeriesData } from '@/features/media/services/seriesService';
import { getMediaReviewsSafe } from '@/lib/api/reviewsQuery';
import {
  getAllowedSeriesIds,
  markLinkableCast,
} from '@/lib/api/tmdbAllowlist';

export { generateMetadata } from '@/features/media/services/seriesMetadata';

/**
 * ISR: la ficha se genera una vez y la CDN la sirve al resto de visitas.
 *
 * Sin esto la ruta era dinámica, así que cada visita —persona o rastreador—
 * invocaba la función y salía a TMDB. Los datos de una ficha (sinopsis, reparto,
 * trailers) no cambian en días; las reseñas, que sí son en vivo, las carga el
 * cliente aparte.
 *
 * Una hora, igual que el `revalidate` de `fetchFromTmdb`: Next toma el valor más
 * bajo de la ruta y de sus `fetch`, así que poner aquí un número mayor no
 * alargaría nada.
 */
export const revalidate = 3600;

/**
 * Prerenderiza en build las series de la allowlist.
 *
 * Antes esto devolvía `[]`. Era el opt-in mínimo para que Next tratase la ruta
 * como ISR en lugar de dinámica —sin `generateStaticParams` no aparece en
 * `dynamicRoutes` de `prerender-manifest.json` y se renderiza en cada
 * petición—, pero dejaba que la primera visita a **cualquiera** de los millones
 * de ids de TMDB pagase un render y se quedase cacheada.
 *
 * Ahora se devuelven los ids que la portada enlaza de verdad
 * (`src/lib/api/tmdbAllowlist.ts`), que son unas decenas: se generan en build,
 * llegan calientes a la primera visita y ya no hay render en frío que pagar.
 *
 * `dynamicParams` sigue en `true`, así que el resto del catálogo se sirve igual
 * —el buscador de `/categories` y los favoritos guardados apuntan a fichas que
 * nunca estarán en esta lista—: se generan a la primera visita, como antes.
 */
export async function generateStaticParams() {
  const ids = await getAllowedSeriesIds();
  return ids.map((id) => ({ id: String(id) }));
}

/** Cualquier id no generado en build se resuelve bajo demanda. */
export const dynamicParams = true;

export default async function SeriePage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    /*
     * Las reseñas se resuelven aquí, en el servidor, y viajan como prop.
     * Antes las pedía `MediaPage` en un `useEffect`, o sea una petición más por
     * cada visita a la ficha. En paralelo con el detalle: son dos orígenes
     * distintos (TMDB y nuestra base de datos) y no dependen entre sí.
     */
    const [serie, initialReviews] = await Promise.all([
      getSeriesData(id),
      getMediaReviewsSafe(Number(id), 'series'),
    ]);

    /*
     * El reparto baja marcado con quién puede emitir `<Link>`: es el primer
     * eslabón del ciclo ficha → reparto → persona → filmografía → más fichas.
     * `ActorCard` es cliente y no puede consultar la allowlist, así que la
     * decisión se toma aquí y viaja pegada a cada actor.
     */
    const media = {
      ...serie,
      actores: markLinkableCast(serie.actores),
    };

    return <MediaPage media={media} initialReviews={initialReviews} />;
  } catch (error) {
    console.error('Error al obtener los datos de la serie:', error);
    notFound();
  }
}

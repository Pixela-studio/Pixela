import { Metadata } from 'next';
import { getMovieData } from './movieService';
import { isAllowedMovie } from '@/lib/api/tmdbAllowlist';

/**
 * `noindex` para lo que no está en la allowlist del catálogo.
 *
 * Es la mitad del freno que sí se pudo aplicar. La otra —que la ficha tampoco
 * ocupase caché ISR— resultó imposible en Next 16 sin PPR; el postmortem está
 * en `src/lib/api/tmdbAllowlist.ts`. Así que lo que queda es esto: sacarla del
 * índice para que un buscador que ya conozca la URL deje de reclamarla cada
 * pocos días. Cada revisita era una invocación, caro y sin ninguna visita a
 * cambio, porque una ficha que nadie busca no posiciona para nada.
 *
 * `follow: false` además de `index: false` porque lo que se corta es el
 * recorrido, no solo la aparición en resultados.
 */
const NOINDEX = { index: false, follow: false } as const;

/**
 * Genera los metadatos para la página de películas
 * @param params Parámetros de la ruta con el ID de la película
 * @returns Objeto Metadata para Next.js
 */
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params;

  try {
    /*
     * En paralelo: la allowlist sale de las mismas listas que ya alimentan la
     * portada y el detalle es otra llamada a TMDB. No dependen entre sí, y las
     * dos son casi siempre aciertos de la Data Cache.
     */
    const [pelicula, isAllowed] = await Promise.all([
      getMovieData(id),
      isAllowedMovie(id),
    ]);

    return {
      title: `${pelicula.titulo} | Pixela`,
      description: pelicula.sinopsis,
      openGraph: {
        title: `${pelicula.titulo} | Pixela`,
        description: pelicula.sinopsis,
        images: [pelicula.poster],
      },
      ...(isAllowed ? {} : { robots: NOINDEX }),
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error al obtener los metadatos de la película:', error);
    }
    return {
      title: 'Película no encontrada | Pixela',
      description: 'La película que buscas no existe o no está disponible.',
      // Una ficha que no se ha podido resolver no tiene nada que indexar.
      robots: NOINDEX,
    };
  }
}

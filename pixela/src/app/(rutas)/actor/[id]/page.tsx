import { notFound } from 'next/navigation';
import { getActorDetails } from '@/features/actor/services/actorService';
import { ActorPage } from '@/features/actor/pages/ActorPage';
import { filterLinkableCredits, isAllowedPerson } from '@/lib/api/tmdbAllowlist';

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
 * Aquí sí se sigue devolviendo `[]`, y no la allowlist como en `/movies` y
 * `/series`.
 *
 * No existe ninguna lista curada de personas: la allowlist de actores es
 * derivada —el reparto principal de los títulos permitidos— y enumerarla de
 * frente obligaría a pedir los `credits` de los 88 títulos curados, o sea 88
 * llamadas a TMDB en cada build que hoy no se hacen. `isAllowedPerson` resuelve
 * la misma relación al revés, desde el `combined_credits` que esta ruta ya pide
 * de todos modos, y por eso no hay nada que prerenderizar.
 *
 * El `[]` sigue siendo necesario: sin `generateStaticParams` la ruta no entra en
 * `dynamicRoutes` de `prerender-manifest.json` y Next la renderiza en cada
 * petición, también para las personas que sí queremos cachear.
 */
export async function generateStaticParams() {
  return [];
}

/** Cualquier id no generado en build se resuelve bajo demanda. */
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  /*
   * `noindex` para todo lo que no esté en la allowlist.
   *
   * En esta ruta es la medida que más pesa. El reparto que devuelve TMDB no
   * está topado en ningún sitio del código —64 personas en un estreno
   * reciente—, así que era la ruta con más ids alcanzables del proyecto: sin
   * `noindex`, un buscador que ya conozca la URL la reclama periódicamente y
   * cada revisita es tráfico pagado sin ninguna visita a cambio, porque la
   * ficha de un secundario de una película que nadie busca no posiciona para
   * nada.
   *
   * `follow: false` además de `index: false` porque lo que se está cortando es
   * el recorrido, no solo la aparición en resultados.
   */
  const noindex = { index: false, follow: false } as const;
  const isAllowed = await isAllowedPerson(id);

  try {
    const actor = await getActorDetails(id);
    return {
      title: `${actor.name} | Pixela`,
      description: actor.biography?.slice(0, 160) || `Perfil de ${actor.name} en Pixela.`,
      ...(isAllowed ? {} : { robots: noindex }),
    };
  } catch {
    return {
      title: 'Actor | Pixela',
      robots: noindex,
    };
  }
}

export default async function ActorRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const actor = await getActorDetails(id);

    /*
     * La filmografía baja con la lista de destinos que puede enlazar.
     *
     * Es el segundo eslabón del ciclo rastreable: veinte fichas nuevas por cada
     * persona, y el reparto de cada una lleva a más personas. `ActorPage` es
     * cliente y elige sus veinte créditos por `vote_average`, así que en vez de
     * duplicar ese criterio aquí se le pasa la intersección de todos sus
     * créditos con la allowlist —cero o un puñado de claves— y allí se consulta.
     */
    const linkableCredits = await filterLinkableCredits([
      ...(actor.combined_credits?.cast ?? []),
      ...(actor.combined_credits?.crew ?? []),
    ]);

    return (
      <ActorPage actor={actor} linkableCredits={linkableCredits} />
    );
  } catch (error) {
    console.error('Error al obtener los datos del actor:', error);
    notFound();
  }
}

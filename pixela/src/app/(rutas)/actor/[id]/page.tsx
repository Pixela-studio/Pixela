import { notFound } from 'next/navigation';
import { getActorDetails } from '@/features/actor/services/actorService';
import { ActorPage } from '@/features/actor/pages/ActorPage';

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
 * Opt-in explícito al modo ISR para una ruta con parámetro dinámico.
 *
 * Con solo `revalidate` no basta: si una ruta `[id]` no declara
 * `generateStaticParams`, Next la trata como totalmente dinámica y la renderiza
 * en cada petición (se comprueba en `prerender-manifest.json`, donde no aparece
 * ninguna `dynamicRoute`).
 *
 * Devolviendo una lista vacía no se prerenderiza nada en build —serían cientos
 * de miles de fichas— pero la ruta entra en el modo "genera a la primera visita
 * y cachea": la primera persona que abre una ficha paga el render, el resto la
 * recibe desde la CDN hasta que expire el `revalidate`.
 */
export async function generateStaticParams() {
  return [];
}

/** Cualquier id no generado en build se resuelve bajo demanda. */
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const actor = await getActorDetails(id);
    return {
      title: `${actor.name} | Pixela`,
      description: actor.biography?.slice(0, 160) || `Perfil de ${actor.name} en Pixela.`,
    };
  } catch {
    return {
      title: 'Actor | Pixela',
    };
  }
}

export default async function ActorRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  try {
    const actor = await getActorDetails(id);
    
    return (
      <ActorPage actor={actor} />
    );
  } catch (error) {
    console.error('Error al obtener los datos del actor:', error);
    notFound();
  }
}

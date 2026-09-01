import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { Review } from "@/api/reviews/types";
import type { ItemType } from "@prisma/client";

/**
 * Consulta de reseñas de un título, en el servidor.
 *
 * Existe para que la ficha pueda traer sus reseñas **sin** una petición HTTP
 * desde el cliente. Antes, `MediaPage` las pedía en un `useEffect` al montar:
 * una Edge Request y una invocación de función por cada vista de ficha, incluso
 * para un visitante anónimo que solo pasaba a mirar. Con las fichas ya en ISR,
 * esa llamada era lo único que quedaba despertando al servidor en cada visita.
 *
 * La misma función la usa la route handler `/api/reviews/media/[tmdbId]/[itemType]`,
 * que sigue existiendo porque el cliente la necesita para refrescar tras
 * publicar, editar o borrar una reseña.
 */

/** Ruta de la ficha a la que pertenece una reseña, para invalidar su caché ISR. */
export function mediaPathFor(tmdbId: number | bigint, itemType: ItemType): string {
  const segment = itemType === "movie" ? "movies" : "series";
  return `/${segment}/${tmdbId}`;
}

export async function getMediaReviews(
  tmdbId: number,
  itemType: ItemType,
): Promise<Review[]> {
  const reviews = await prisma.review.findMany({
    where: {
      tmdbId: BigInt(tmdbId),
      itemType,
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, photoUrl: true } },
    },
  });

  return reviews.map((review) => ({
    id: review.id,
    user_id: review.userId,
    user_name: review.user.name,
    photo_url: review.user.photoUrl ?? undefined,
    tmdb_id: Number(review.tmdbId),
    item_type: review.itemType,
    rating: Number(review.rating),
    review: review.review ?? "",
    created_at: review.createdAt.toISOString(),
    updated_at: review.updatedAt.toISOString(),
  }));
}

/**
 * Igual que `getMediaReviews`, pero nunca lanza.
 *
 * La usan las páginas de ficha, y la diferencia importa: la ficha se renderiza
 * con datos de TMDB, y las reseñas son un añadido. Si la base de datos está
 * caída —el plan gratuito de Supabase pausa el proyecto por inactividad, sin ir
 * más lejos—, `getMediaReviews` lanza, el `try/catch` de la página lo interpreta
 * como "esta película no existe" y llama a `notFound()`: un 404 en una ficha
 * perfectamente válida porque falló algo secundario.
 *
 * Devolviendo una lista vacía, la ficha se ve entera y solo falta el bloque de
 * reseñas, que el cliente puede recargar por su cuenta cuando la base vuelva.
 *
 * La route handler sigue usando `getMediaReviews` a secas: ahí un fallo **sí**
 * debe salir como 500, porque quien llama necesita distinguir "no hay reseñas"
 * de "no se han podido leer".
 */
export async function getMediaReviewsSafe(
  tmdbId: number,
  itemType: ItemType,
): Promise<Review[]> {
  try {
    return await getMediaReviews(tmdbId, itemType);
  } catch (error) {
    logger.error("Failed to load reviews for media page", error, {
      tmdbId,
      itemType,
    });
    return [];
  }
}

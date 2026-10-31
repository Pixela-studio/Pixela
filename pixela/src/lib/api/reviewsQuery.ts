import { revalidatePath } from "next/cache";
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

/**
 * URL de la foto del autor, nunca la foto en sí.
 *
 * Las fotos subidas son data URI de hasta 512 KB y viajaban dentro del HTML de
 * la ficha. Se sirven aparte desde `/api/users/[id]/avatar`, con la fecha de
 * actualización como versión para poder cachearlas.
 */
export function avatarUrlFor(userId: number, photoUrl: string | null, updatedAt: Date): string | undefined {
  if (!photoUrl) return undefined;
  if (photoUrl.startsWith("https://")) return photoUrl;
  if (!photoUrl.startsWith("data:image/")) return undefined;
  return `/api/users/${userId}/avatar?v=${updatedAt.getTime()}`;
}

/**
 * Reseñas de un título: las públicas y, si se pasa `viewerId`, también las
 * «solo para mí» de esa persona. La ficha ISR llama sin `viewerId`: su HTML es
 * el mismo para todos y no puede llevar nada privado.
 */
export async function getMediaReviews(
  tmdbId: number,
  itemType: ItemType,
  viewerId?: number,
): Promise<Review[]> {
  const reviews = await prisma.review.findMany({
    where: {
      tmdbId: BigInt(tmdbId),
      itemType,
      OR: [{ isPublic: true }, ...(viewerId ? [{ userId: viewerId }] : [])],
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, photoUrl: true, updatedAt: true } },
    },
  });

  return reviews.map((review) => ({
    id: review.id,
    // Hace falta para que el autor vea "editar" y "borrar" en la suya.
    user_id: review.userId,
    user_name: review.user.name,
    photo_url: avatarUrlFor(review.userId, review.user.photoUrl, review.user.updatedAt),
    tmdb_id: Number(review.tmdbId),
    item_type: review.itemType,
    rating: Number(review.rating),
    review: review.review ?? "",
    is_public: review.isPublic,
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
    // Aviso y no error: el fallo está controlado (la ficha se pinta sin
    // reseñas) y `console.error` en el servidor dispara el overlay de Next en
    // desarrollo. Se registra el mensaje en texto porque un `Error` se
    // serializa como `{}` al llegar al navegador. De Prisma basta la última
    // línea ("Error querying the database: …"); el resto es el código citado.
    const message = error instanceof Error ? error.message : String(error);
    logger.warn("Failed to load reviews for media page", {
      error: message.trim().split("\n").pop(),
      tmdbId,
      itemType,
    });
    return [];
  }
}

/**
 * Fichas donde un usuario tiene reseñas.
 *
 * Las fichas son ISR y llevan dentro el nombre y la foto del autor de cada
 * reseña. Si el autor cambia de nombre o de foto, o borra la cuenta, hay que
 * invalidarlas; si no, siguen mostrando lo de antes hasta una hora.
 */
export async function reviewPathsOf(userId: number): Promise<string[]> {
  const rows = await prisma.review.findMany({
    where: { userId },
    select: { tmdbId: true, itemType: true },
  });
  return rows.map((row) => mediaPathFor(row.tmdbId, row.itemType));
}

export function revalidatePaths(paths: string[]): void {
  for (const path of new Set(paths)) revalidatePath(path);
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { fetchFromTmdb } from "@/lib/tmdb";
import { logger } from "@/lib/logger";
import { requireUser } from "@/lib/api/guards";
import {
  handleRouteError,
  parseJsonBody,
  validationError,
} from "@/lib/api/responses";
import { createReviewSchema } from "@/lib/api/schemas";
import { enforceRateLimit } from "@/lib/api/rateLimit";
import { mediaPathFor } from "@/lib/api/reviewsQuery";

interface TmdbMediaDetails {
  title?: string;
  name?: string;
  poster_path?: string | null;
}

/** Escrituras de reseñas permitidas por usuario y minuto. */
const REVIEW_WRITE_LIMIT = { name: "review-write", limit: 20, windowMs: 60_000 };

export async function GET() {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  try {
    const reviews = await prisma.review.findMany({
      where: { userId: guard.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, photoUrl: true } },
      },
    });

    // Enriquecer con TMDB. `allSettled` en vez de un try/catch por item:
    // el mapeo del fallback estaba duplicado palabra por palabra.
    const details = await Promise.allSettled(
      reviews.map((review) =>
        fetchFromTmdb<TmdbMediaDetails>(
          `${review.itemType === "movie" ? "movie" : "tv"}/${review.tmdbId}`,
        ),
      ),
    );

    const enrichedReviews = reviews.map((review, index) => {
      const result = details[index];
      const tmdbData = result.status === "fulfilled" ? result.value : null;

      if (result.status === "rejected") {
        logger.error(`Error enriching review ${review.id}`, result.reason);
      }

      return {
        id: review.id,
        user_id: review.userId,
        user_name: review.user.name,
        photo_url: review.user.photoUrl,
        tmdb_id: Number(review.tmdbId),
        item_type: review.itemType,
        rating: Number(review.rating),
        review: review.review,
        created_at: review.createdAt.toISOString(),
        updated_at: review.updatedAt.toISOString(),
        title:
          tmdbData?.title ?? tmdbData?.name ?? `Media #${review.tmdbId}`,
        poster_path: tmdbData?.poster_path ?? null,
      };
    });

    return NextResponse.json({ success: true, data: enrichedReviews });
  } catch (error) {
    return handleRouteError("Failed to list reviews", error);
  }
}

export async function POST(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const limited = enforceRateLimit(
    request,
    REVIEW_WRITE_LIMIT,
    String(guard.user.id),
  );
  if (limited) return limited;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  /*
   * El handler anterior solo comprobaba presencia de campos y pasaba `rating`
   * crudo a Prisma: se aceptaban puntuaciones negativas o de tres cifras (que
   * reventaban el Decimal(3,1) con un 500) y reseñas de longitud ilimitada.
   */
  const parsed = createReviewSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  const { tmdb_id, item_type, rating, review } = parsed.data;

  try {
    const newReview = await prisma.review.upsert({
      where: {
        userId_itemType_tmdbId: {
          userId: guard.user.id,
          itemType: item_type,
          tmdbId: BigInt(tmdb_id),
        },
      },
      update: { rating, review: review ?? null },
      create: {
        userId: guard.user.id,
        itemType: item_type,
        tmdbId: BigInt(tmdb_id),
        rating,
        review: review ?? null,
      },
      include: {
        user: { select: { name: true, photoUrl: true } },
      },
    });

/**
 * Invalida el HTML cacheado de la ficha tras tocar sus reseñas.
 *
 * Las fichas son ISR con una hora de vida, así que sin esto una reseña nueva
 * tardaría hasta una hora en verse para el resto de visitantes. `revalidatePath`
 * marca **solo** esa ficha, no todas: se regenera una página, no el catálogo.
 *
 * Quien escribe la reseña no depende de esto — su propia vista se refresca
 * llamando a la API — pero el resto sí.
 */
    revalidatePath(mediaPathFor(newReview.tmdbId, newReview.itemType));

    return NextResponse.json({
      success: true,
      data: {
        id: newReview.id,
        user_id: newReview.userId,
        user_name: newReview.user.name,
        photo_url: newReview.user.photoUrl,
        tmdb_id: Number(newReview.tmdbId),
        item_type: newReview.itemType,
        rating: Number(newReview.rating),
        review: newReview.review,
        created_at: newReview.createdAt.toISOString(),
        updated_at: newReview.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    return handleRouteError("Failed to create/update review", error);
  }
}

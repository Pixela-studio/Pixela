import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { fetchFromTmdb } from "@/lib/tmdb";
import { logger } from "@/lib/logger";
import { requireUser } from "@/lib/api/guards";
import {
  apiError,
  handleRouteError,
  parseJsonBody,
  validationError,
} from "@/lib/api/responses";
import { resourceIdSchema, updateReviewSchema } from "@/lib/api/schemas";

interface TmdbMediaDetails {
  title?: string;
  name?: string;
  poster_path?: string | null;
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const parsedId = resourceIdSchema.safeParse(params.id);
  if (!parsedId.success) return apiError("ID inválido", 400);
  const id = parsedId.data;

  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  // `body.rating` y `body.review` llegaban sin validar directo a Prisma.
  const parsed = updateReviewSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review || review.userId !== guard.user.id) {
      return apiError("No tienes permiso para editar esta reseña", 403);
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(parsed.data.rating !== undefined ? { rating: parsed.data.rating } : {}),
        ...(parsed.data.review !== undefined
          ? { review: parsed.data.review ?? null }
          : {}),
      },
      include: {
        user: { select: { name: true, photoUrl: true } },
      },
    });

    // El enriquecido con TMDB es cosmético: si falla no debe tumbar el guardado,
    // que ya está confirmado en base de datos.
    let tmdbData: TmdbMediaDetails | null = null;
    try {
      tmdbData = await fetchFromTmdb<TmdbMediaDetails>(
        `${updatedReview.itemType === "movie" ? "movie" : "tv"}/${updatedReview.tmdbId}`,
      );
    } catch (error) {
      logger.error("Failed to enrich updated review", error, { reviewId: id });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedReview.id,
        user_id: updatedReview.userId,
        user_name: updatedReview.user.name,
        photo_url: updatedReview.user.photoUrl,
        tmdb_id: Number(updatedReview.tmdbId),
        item_type: updatedReview.itemType,
        rating: Number(updatedReview.rating),
        review: updatedReview.review,
        created_at: updatedReview.createdAt.toISOString(),
        updated_at: updatedReview.updatedAt.toISOString(),
        title: tmdbData?.title ?? tmdbData?.name ?? "Sin título",
        poster_path: tmdbData?.poster_path ?? null,
      },
    });
  } catch (error) {
    return handleRouteError("Failed to update review", error, { reviewId: id });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const parsedId = resourceIdSchema.safeParse(params.id);
  if (!parsedId.success) return apiError("ID inválido", 400);
  const id = parsedId.data;

  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  try {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review || (review.userId !== guard.user.id && !guard.user.isAdmin)) {
      return apiError("No tienes permiso para eliminar esta reseña", 403);
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError("Failed to delete review", error, { reviewId: id });
  }
}

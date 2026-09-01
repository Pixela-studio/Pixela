import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { apiError, handleRouteError } from "@/lib/api/responses";
import { itemTypeSchema, tmdbIdSchema } from "@/lib/api/schemas";

/**
 * GET /api/reviews/media/:tmdbId/:itemType — reseñas públicas de un título.
 *
 * Bug corregido: `BigInt(params.tmdbId)` se ejecutaba **fuera** del try/catch,
 * así que `/api/reviews/media/abc/movie` lanzaba un SyntaxError sin capturar y
 * devolvía un 500 con traza en lugar de un 400. El `itemType as any` permitía
 * además colar un valor fuera del enum y hacer fallar la query.
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ tmdbId: string; itemType: string }> },
) {
  const params = await props.params;

  const parsedTmdbId = tmdbIdSchema.safeParse(params.tmdbId);
  const parsedItemType = itemTypeSchema.safeParse(params.itemType);

  if (!parsedTmdbId.success || !parsedItemType.success) {
    return apiError("Parámetros inválidos", 400);
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        tmdbId: BigInt(parsedTmdbId.data),
        itemType: parsedItemType.data,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, photoUrl: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: reviews.map((review) => ({
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
      })),
    });
  } catch (error) {
    return handleRouteError("Failed to fetch media reviews", error);
  }
}

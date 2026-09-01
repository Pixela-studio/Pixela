import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import {
  apiError,
  handleRouteError,
  parseJsonBody,
  validationError,
} from "@/lib/api/responses";
import { createFavoriteSchema } from "@/lib/api/schemas";

export async function POST(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  /*
   * Antes se hacía `BigInt(tmdb_id)` sobre un body sin validar: un POST sin
   * `tmdb_id` lanzaba un TypeError y salía como 500, y un `item_type` arbitrario
   * hacía fallar el insert contra el enum de Postgres.
   */
  const parsed = createFavoriteSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  const { tmdb_id, item_type } = parsed.data;

  try {
    const favorite = await prisma.favorite.create({
      data: {
        userId: guard.user.id,
        tmdbId: BigInt(tmdb_id),
        itemType: item_type,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: favorite.id,
          user_id: favorite.userId,
          tmdb_id: Number(favorite.tmdbId),
          item_type: favorite.itemType,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return apiError("Ya está en favoritos", 409);
    }
    return handleRouteError("Failed to create favorite", error);
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import { handleRouteError } from "@/lib/api/responses";
import {
  FALLBACK_SUMMARY,
  enrichWithTmdb,
  mediaKey,
} from "@/lib/api/mediaEnrichment";

export async function GET() {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: guard.user.id },
      orderBy: { createdAt: "desc" },
    });

    const summaries = await enrichWithTmdb(favorites);

    return NextResponse.json({
      success: true,
      data: favorites.map((favorite) => {
        const summary =
          summaries.get(mediaKey(favorite.itemType, favorite.tmdbId)) ??
          FALLBACK_SUMMARY;

        return {
          id: favorite.id,
          user_id: favorite.userId,
          tmdb_id: Number(favorite.tmdbId),
          item_type: favorite.itemType,
          ...summary,
        };
      }),
    });
  } catch (error) {
    return handleRouteError("Failed to list favorites with details", error);
  }
}

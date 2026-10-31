import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import { apiError, handleRouteError } from "@/lib/api/responses";
import { watchStatusSchema } from "@/lib/api/schemas";
import {
  FALLBACK_SUMMARY,
  enrichWithTmdb,
  mediaKey,
} from "@/lib/api/mediaEnrichment";

export async function GET(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");

  /*
   * `whereClause` era `any` y el `status` de la query se inyectaba sin validar:
   * cualquier valor fuera del enum `WatchStatus` hacía que Prisma lanzara y la
   * ruta respondiera 500 en vez de 400.
   */
  const where: Prisma.LibraryItemWhereInput = { userId: guard.user.id };

  if (statusParam) {
    const parsedStatus = watchStatusSchema.safeParse(statusParam);
    if (!parsedStatus.success) {
      return apiError("Estado de biblioteca inválido", 400);
    }
    where.status = parsedStatus.data;
  }

  try {
    const libraryItems = await prisma.libraryItem.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    });

    const [summaries, episodeCounts] = await Promise.all([
      enrichWithTmdb(libraryItems),
      // Capítulos vistos por serie, para que la biblioteca diga por dónde va.
      prisma.episodeWatch.groupBy({
        by: ["tmdbId"],
        where: { userId: guard.user.id },
        _count: { _all: true },
      }),
    ]);
    const watchedBySeries = new Map(episodeCounts.map((row) => [String(row.tmdbId), row._count._all]));

    return NextResponse.json({
      success: true,
      data: libraryItems.map((item) => {
        const summary =
          summaries.get(mediaKey(item.itemType, item.tmdbId)) ?? FALLBACK_SUMMARY;

        return {
          id: item.id,
          user_id: item.userId,
          tmdb_id: Number(item.tmdbId),
          item_type: item.itemType,
          status: item.status,
          updated_at: item.updatedAt,
          episodes_watched:
            item.itemType === "series" ? watchedBySeries.get(String(item.tmdbId)) ?? 0 : undefined,
          ...summary,
        };
      }),
    });
  } catch (error) {
    return handleRouteError("Failed to list library", error);
  }
}

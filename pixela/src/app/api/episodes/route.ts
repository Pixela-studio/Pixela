import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import { apiError, handleRouteError, parseJsonBody, validationError } from "@/lib/api/responses";
import { episodeToggleSchema, tmdbIdSchema } from "@/lib/api/schemas";

/** GET /api/episodes?tmdb_id= — capítulos vistos de una serie: `[[temporada, episodio], …]`. */
export async function GET(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const tmdbId = tmdbIdSchema.safeParse(new URL(request.url).searchParams.get("tmdb_id"));
  if (!tmdbId.success) return apiError("Serie no válida", 400);

  try {
    const watched = await prisma.episodeWatch.findMany({
      where: { userId: guard.user.id, tmdbId: BigInt(tmdbId.data) },
      select: { season: true, episode: true },
      orderBy: [{ season: "asc" }, { episode: "asc" }],
    });
    return NextResponse.json(
      { success: true, data: watched.map((w) => [w.season, w.episode]) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return handleRouteError("Failed to list watched episodes", error, { userId: guard.user.id });
  }
}

/**
 * POST /api/episodes — marcar o desmarcar uno o varios capítulos de una
 * temporada. Al marcar el primero, la serie pasa a «Viendo» en la biblioteca
 * si no estaba (o estaba en «Planeado»).
 */
export async function POST(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = episodeToggleSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  const { tmdb_id, season, episodes, watched } = parsed.data;
  const tmdbId = BigInt(tmdb_id);
  const userId = guard.user.id;

  try {
    if (watched) {
      await prisma.episodeWatch.createMany({
        data: episodes.map((episode) => ({ userId, tmdbId, season, episode })),
        skipDuplicates: true,
      });

      const library = await prisma.libraryItem.findUnique({
        where: { userId_itemType_tmdbId: { userId, itemType: "series", tmdbId } },
        select: { status: true },
      });
      if (!library) {
        await prisma.libraryItem.create({ data: { userId, itemType: "series", tmdbId, status: "WATCHING" } });
      } else if (library.status === "PLAN_TO_WATCH") {
        await prisma.libraryItem.update({
          where: { userId_itemType_tmdbId: { userId, itemType: "series", tmdbId } },
          data: { status: "WATCHING" },
        });
      }
    } else {
      await prisma.episodeWatch.deleteMany({
        where: { userId, tmdbId, season, episode: { in: episodes } },
      });
    }

    const total = await prisma.episodeWatch.count({ where: { userId, tmdbId } });
    return NextResponse.json({ success: true, data: { watched_count: total } });
  } catch (error) {
    return handleRouteError("Failed to toggle episodes", error, { userId });
  }
}

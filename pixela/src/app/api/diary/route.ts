import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import { handleRouteError, parseJsonBody, validationError } from "@/lib/api/responses";
import { createDiaryEntrySchema, itemTypeSchema, tmdbIdSchema } from "@/lib/api/schemas";
import { enrichWithTmdb } from "@/lib/api/mediaEnrichment";

const PAGE_SIZE = 50;

/**
 * GET /api/diary — el diario de quien pregunta, del más reciente al más
 * antiguo. `?before=<id>` pagina; `?tmdb_id=&item_type=` devuelve solo las
 * entradas de ese título (la ficha lo usa para saber si sería un revisionado).
 */
export async function GET(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const tmdbId = tmdbIdSchema.safeParse(searchParams.get("tmdb_id"));
  const itemType = itemTypeSchema.safeParse(searchParams.get("item_type"));
  const before = Number.parseInt(searchParams.get("before") ?? "", 10);

  try {
    const entries = await prisma.diaryEntry.findMany({
      where: {
        userId: guard.user.id,
        ...(tmdbId.success && itemType.success ? { tmdbId: BigInt(tmdbId.data), itemType: itemType.data } : {}),
        ...(Number.isInteger(before) ? { id: { lt: before } } : {}),
      },
      orderBy: [{ watchedOn: "desc" }, { id: "desc" }],
      take: PAGE_SIZE,
    });

    const summaries = await enrichWithTmdb(entries);
    const data = entries.map((entry) => {
      const summary = summaries.get(`${entry.itemType}:${entry.tmdbId}`);
      return {
        id: entry.id,
        tmdb_id: Number(entry.tmdbId),
        item_type: entry.itemType,
        watched_on: entry.watchedOn.toISOString().slice(0, 10),
        rating: entry.rating === null ? null : Number(entry.rating),
        note: entry.note,
        rewatch: entry.rewatch,
        title: summary?.title ?? "",
        poster_path: summary?.poster_path ?? null,
        release_date: summary?.release_date ?? "",
      };
    });

    return NextResponse.json(
      { success: true, data, has_more: entries.length === PAGE_SIZE },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return handleRouteError("Failed to list diary", error, { userId: guard.user.id });
  }
}

/** POST /api/diary — apuntar un visionado. */
export async function POST(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = createDiaryEntrySchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  const { tmdb_id, item_type, watched_on, rating, note, rewatch, mark_completed } = parsed.data;
  const tmdbId = BigInt(tmdb_id);

  try {
    const previous = await prisma.diaryEntry.count({
      where: { userId: guard.user.id, itemType: item_type, tmdbId },
    });

    const entry = await prisma.diaryEntry.create({
      data: {
        userId: guard.user.id,
        itemType: item_type,
        tmdbId,
        watchedOn: new Date(`${watched_on}T00:00:00Z`),
        rating: rating ?? null,
        note: note || null,
        rewatch: rewatch ?? previous > 0,
      },
      select: { id: true, rewatch: true },
    });

    if (mark_completed) {
      await prisma.libraryItem.upsert({
        where: { userId_itemType_tmdbId: { userId: guard.user.id, itemType: item_type, tmdbId } },
        update: { status: "COMPLETED" },
        create: { userId: guard.user.id, itemType: item_type, tmdbId, status: "COMPLETED" },
      });
    }

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    return handleRouteError("Failed to create diary entry", error, { userId: guard.user.id });
  }
}

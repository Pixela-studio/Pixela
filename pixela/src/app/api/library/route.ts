import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import {
  apiError,
  handleRouteError,
  parseJsonBody,
  validationError,
} from "@/lib/api/responses";
import {
  createLibraryItemSchema,
  itemTypeSchema,
  tmdbIdSchema,
} from "@/lib/api/schemas";

export async function POST(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = createLibraryItemSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  const { tmdb_id, item_type, status } = parsed.data;

  try {
    const libraryItem = await prisma.libraryItem.create({
      data: {
        userId: guard.user.id,
        tmdbId: BigInt(tmdb_id),
        itemType: item_type,
        status: status ?? "PLAN_TO_WATCH",
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: { ...libraryItem, tmdbId: libraryItem.tmdbId.toString() },
      },
      { status: 201 },
    );
  } catch (error) {
    // El índice único (userId, itemType, tmdbId) hacía que un segundo "añadir"
    // saliera como 500 genérico en lugar de un conflicto explícito.
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return apiError("Este título ya está en tu biblioteca", 409);
    }
    return handleRouteError("Failed to add library item", error);
  }
}

export async function GET(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const parsedTmdbId = tmdbIdSchema.safeParse(searchParams.get("tmdbId"));
  const parsedItemType = itemTypeSchema.safeParse(searchParams.get("itemType"));

  if (!parsedTmdbId.success || !parsedItemType.success) {
    return apiError("Parámetros inválidos", 400);
  }

  try {
    const item = await prisma.libraryItem.findFirst({
      where: {
        userId: guard.user.id,
        tmdbId: BigInt(parsedTmdbId.data),
        itemType: parsedItemType.data,
      },
    });

    if (!item) {
      return NextResponse.json({ inLibrary: false });
    }

    return NextResponse.json({
      inLibrary: true,
      data: { ...item, tmdbId: item.tmdbId.toString() },
    });
  } catch (error) {
    return handleRouteError("Failed to check library status", error);
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import { apiError, handleRouteError, parseJsonBody, validationError } from "@/lib/api/responses";
import { createListSchema, itemTypeSchema, tmdbIdSchema } from "@/lib/api/schemas";
import { MAX_LISTS_PER_USER, getListById, getListsOfUser, newShareId, toListDto } from "@/lib/api/lists";

/**
 * GET /api/lists — las listas de quien pregunta, con la portada de cada una.
 *
 * Con `?tmdb_id=&item_type=` añade `contains_item_id` a cada lista (el id del
 * elemento si el título ya está, `null` si no): es lo que necesita el diálogo
 * «Añadir a una lista» de la ficha para marcar y desmarcar las casillas.
 */
export async function GET(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const { searchParams } = new URL(request.url);
  const tmdbId = tmdbIdSchema.safeParse(searchParams.get("tmdb_id"));
  const itemType = itemTypeSchema.safeParse(searchParams.get("item_type"));

  try {
    const lists = await getListsOfUser(guard.user.id);
    const data = await Promise.all(
      lists.map(async (list) => ({
        ...(await toListDto(list, "cover")),
        ...(tmdbId.success && itemType.success
          ? {
              contains_item_id:
                list.items.find(
                  (item) => item.itemType === itemType.data && Number(item.tmdbId) === tmdbId.data,
                )?.id ?? null,
            }
          : {}),
      })),
    );
    return NextResponse.json(
      { success: true, data },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return handleRouteError("Failed to list lists", error, { userId: guard.user.id });
  }
}

/** POST /api/lists — crear una lista. */
export async function POST(request: Request) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = createListSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const count = await prisma.list.count({ where: { userId: guard.user.id } });
    if (count >= MAX_LISTS_PER_USER) {
      return apiError(`Puedes tener hasta ${MAX_LISTS_PER_USER} listas.`, 400);
    }

    const created = await prisma.list.create({
      data: {
        userId: guard.user.id,
        name: parsed.data.name,
        description: parsed.data.description || null,
        visibility: parsed.data.visibility ?? "PRIVATE",
        shareId: newShareId(),
      },
      select: { id: true },
    });

    const list = await getListById(created.id);
    return NextResponse.json({ success: true, data: await toListDto(list!) }, { status: 201 });
  } catch (error) {
    return handleRouteError("Failed to create list", error, { userId: guard.user.id });
  }
}

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import { apiError, handleRouteError, parseJsonBody, validationError } from "@/lib/api/responses";
import { addListItemSchema, reorderListSchema, resourceIdSchema } from "@/lib/api/schemas";
import { MAX_LIST_ITEMS } from "@/lib/api/lists";

type Params = { params: Promise<{ id: string }> };

async function ownedList(props: Params, userId: number) {
  const id = resourceIdSchema.safeParse((await props.params).id);
  if (!id.success) return null;
  return prisma.list.findFirst({
    where: { id: id.data, userId },
    select: { id: true, shareId: true, _count: { select: { items: true } } },
  });
}

/** POST /api/lists/:id/items — añadir un título al final de la lista. */
export async function POST(request: Request, props: Params) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = addListItemSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const list = await ownedList(props, guard.user.id);
    if (!list) return apiError("Lista no encontrada", 404);
    if (list._count.items >= MAX_LIST_ITEMS) {
      return apiError(`Una lista admite hasta ${MAX_LIST_ITEMS} títulos.`, 400);
    }

    const last = await prisma.listItem.aggregate({
      where: { listId: list.id },
      _max: { position: true },
    });

    const item = await prisma.listItem.create({
      data: {
        listId: list.id,
        itemType: parsed.data.item_type,
        tmdbId: BigInt(parsed.data.tmdb_id),
        note: parsed.data.note || null,
        position: (last._max.position ?? -1) + 1,
      },
      select: { id: true },
    });
    // Se toca la lista para que suba en «últimas modificadas».
    await prisma.list.update({ where: { id: list.id }, data: { updatedAt: new Date() } });
    revalidatePath(`/listas/${list.shareId}`);

    return NextResponse.json({ success: true, data: { id: item.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return apiError("Ese título ya está en la lista.", 409);
    }
    return handleRouteError("Failed to add list item", error);
  }
}

/** PUT /api/lists/:id/items — nuevo orden completo, de arriba abajo. */
export async function PUT(request: Request, props: Params) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = reorderListSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const list = await ownedList(props, guard.user.id);
    if (!list) return apiError("Lista no encontrada", 404);

    const current = await prisma.listItem.findMany({ where: { listId: list.id }, select: { id: true } });
    const currentIds = new Set(current.map((item) => item.id));
    const requested = parsed.data.item_ids;
    if (requested.length !== currentIds.size || !requested.every((id) => currentIds.has(id))) {
      return apiError("El orden no coincide con los títulos de la lista. Recarga y vuelve a probar.", 409);
    }

    await prisma.$transaction(
      requested.map((itemId, position) =>
        prisma.listItem.update({ where: { id: itemId }, data: { position } }),
      ),
    );
    await prisma.list.update({ where: { id: list.id }, data: { updatedAt: new Date() } });
    revalidatePath(`/listas/${list.shareId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError("Failed to reorder list", error);
  }
}

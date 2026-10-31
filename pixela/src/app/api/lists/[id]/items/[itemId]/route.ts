import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import { apiError, handleRouteError } from "@/lib/api/responses";
import { resourceIdSchema } from "@/lib/api/schemas";

type Params = { params: Promise<{ id: string; itemId: string }> };

/** DELETE /api/lists/:id/items/:itemId — quitar un título de la lista. */
export async function DELETE(_request: Request, props: Params) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const params = await props.params;
  const listId = resourceIdSchema.safeParse(params.id);
  const itemId = resourceIdSchema.safeParse(params.itemId);
  if (!listId.success || !itemId.success) return apiError("ID inválido", 400);

  try {
    const item = await prisma.listItem.findFirst({
      where: { id: itemId.data, listId: listId.data, list: { userId: guard.user.id } },
      select: { id: true, list: { select: { shareId: true } } },
    });
    if (!item) return apiError("No está en tu lista", 404);

    await prisma.listItem.delete({ where: { id: item.id } });
    await prisma.list.update({ where: { id: listId.data }, data: { updatedAt: new Date() } });
    revalidatePath(`/listas/${item.list.shareId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError("Failed to remove list item", error);
  }
}

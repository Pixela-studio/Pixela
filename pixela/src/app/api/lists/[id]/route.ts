import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { requireUser } from "@/lib/api/guards";
import { apiError, handleRouteError, parseJsonBody, validationError } from "@/lib/api/responses";
import { resourceIdSchema, updateListSchema } from "@/lib/api/schemas";
import { getListById, isViewableByOthers, toListDto } from "@/lib/api/lists";

type Params = { params: Promise<{ id: string }> };

const parseId = async (props: Params) => resourceIdSchema.safeParse((await props.params).id);

/** GET /api/lists/:id — la dueña siempre; el resto, si no es privada. */
export async function GET(_request: Request, props: Params) {
  const id = await parseId(props);
  if (!id.success) return apiError("ID inválido", 400);

  try {
    const list = await getListById(id.data);
    const session = await auth();
    const viewerId = Number.parseInt(session?.user?.id ?? "", 10);
    if (!list || (list.userId !== viewerId && !isViewableByOthers(list.visibility))) {
      return apiError("Lista no encontrada", 404);
    }
    return NextResponse.json({ success: true, data: await toListDto(list) });
  } catch (error) {
    return handleRouteError("Failed to get list", error, { listId: id.data });
  }
}

/** PATCH /api/lists/:id — nombre, descripción o visibilidad. */
export async function PATCH(request: Request, props: Params) {
  const id = await parseId(props);
  if (!id.success) return apiError("ID inválido", 400);

  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = updateListSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const owned = await prisma.list.findFirst({
      where: { id: id.data, userId: guard.user.id },
      select: { shareId: true },
    });
    if (!owned) return apiError("Lista no encontrada", 404);

    await prisma.list.update({
      where: { id: id.data },
      data: {
        ...(parsed.data.name !== undefined && { name: parsed.data.name }),
        ...(parsed.data.description !== undefined && { description: parsed.data.description || null }),
        ...(parsed.data.visibility !== undefined && { visibility: parsed.data.visibility }),
      },
    });
    revalidatePath(`/listas/${owned.shareId}`);

    const list = await getListById(id.data);
    return NextResponse.json({ success: true, data: await toListDto(list!) });
  } catch (error) {
    return handleRouteError("Failed to update list", error, { listId: id.data });
  }
}

/** DELETE /api/lists/:id */
export async function DELETE(_request: Request, props: Params) {
  const id = await parseId(props);
  if (!id.success) return apiError("ID inválido", 400);

  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  try {
    const owned = await prisma.list.findFirst({
      where: { id: id.data, userId: guard.user.id },
      select: { shareId: true },
    });
    if (!owned) return apiError("Lista no encontrada", 404);

    await prisma.list.delete({ where: { id: id.data } });
    revalidatePath(`/listas/${owned.shareId}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError("Failed to delete list", error, { listId: id.data });
  }
}

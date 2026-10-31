import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import { apiError, handleRouteError } from "@/lib/api/responses";
import { resourceIdSchema } from "@/lib/api/schemas";

/** DELETE /api/diary/:id — borrar una entrada propia del diario. */
export async function DELETE(_request: Request, props: { params: Promise<{ id: string }> }) {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const id = resourceIdSchema.safeParse((await props.params).id);
  if (!id.success) return apiError("ID inválido", 400);

  try {
    const { count } = await prisma.diaryEntry.deleteMany({ where: { id: id.data, userId: guard.user.id } });
    if (count === 0) return apiError("Entrada no encontrada", 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError("Failed to delete diary entry", error, { entryId: id.data });
  }
}

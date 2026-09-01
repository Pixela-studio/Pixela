import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import {
  apiError,
  handleRouteError,
  parseJsonBody,
  validationError,
} from "@/lib/api/responses";
import { resourceIdSchema, updateLibraryItemSchema } from "@/lib/api/schemas";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsedId = resourceIdSchema.safeParse((await params).id);
  if (!parsedId.success) return apiError("ID inválido", 400);
  const libraryItemId = parsedId.data;

  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = updateLibraryItemSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const existingItem = await prisma.libraryItem.findUnique({
      where: { id: libraryItemId },
    });

    if (!existingItem || existingItem.userId !== guard.user.id) {
      return apiError("Item no encontrado o no autorizado", 404);
    }

    const updatedItem = await prisma.libraryItem.update({
      where: { id: libraryItemId },
      data: { status: parsed.data.status },
    });

    return NextResponse.json({
      success: true,
      data: { ...updatedItem, tmdbId: updatedItem.tmdbId.toString() },
    });
  } catch (error) {
    return handleRouteError("Failed to update library item", error, {
      libraryItemId,
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const parsedId = resourceIdSchema.safeParse((await params).id);
  if (!parsedId.success) return apiError("ID inválido", 400);
  const libraryItemId = parsedId.data;

  const guard = await requireUser();
  if (!guard.ok) return guard.response;

  try {
    const existingItem = await prisma.libraryItem.findUnique({
      where: { id: libraryItemId },
    });

    if (!existingItem || existingItem.userId !== guard.user.id) {
      return apiError("Item no encontrado o no autorizado", 404);
    }

    await prisma.libraryItem.delete({ where: { id: libraryItemId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError("Failed to delete library item", error, {
      libraryItemId,
    });
  }
}

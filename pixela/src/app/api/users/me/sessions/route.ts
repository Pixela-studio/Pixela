import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import { handleRouteError } from "@/lib/api/responses";

/**
 * Cierra la sesión en todos los dispositivos.
 *
 * Incrementa `tokenVersion`: desde ese momento `auth.ts` rechaza cualquier JWT
 * emitido antes, también el de este navegador, que el cliente cierra a
 * continuación con `signOut`.
 */
export async function DELETE() {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;
  const { id } = guard.user;

  try {
    await prisma.user.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } },
      select: { id: true },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError("Failed to revoke sessions", error, { userId: id });
  }
}

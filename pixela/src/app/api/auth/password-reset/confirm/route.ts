import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { apiError, handleRouteError, parseJsonBody, validationError } from "@/lib/api/responses";
import { enforceRateLimit } from "@/lib/api/rateLimit";
import { passwordSchema } from "@/lib/validation/account";
import { hashResetToken, isWellFormedResetToken } from "@/lib/passwordReset";

const BCRYPT_ROUNDS = 12;

const confirmSchema = z.object({
  token: z.string().refine(isWellFormedResetToken, "El enlace no es válido."),
  password: passwordSchema,
});

const CONFIRM_LIMIT = { name: "password-reset-confirm", limit: 20, windowMs: 60 * 60 * 1000 };

/**
 * POST /api/auth/password-reset/confirm — fija la contraseña nueva.
 *
 * Además cierra todas las sesiones abiertas (`tokenVersion`): si alguien
 * entró con la contraseña vieja, deja de estar dentro.
 */
export async function POST(request: Request) {
  const limited = enforceRateLimit(request, CONFIRM_LIMIT);
  if (limited) return limited;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = confirmSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashResetToken(parsed.data.token) },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      return apiError("Este enlace ha caducado o ya se usó. Pide uno nuevo.", 400);
    }

    const password = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { password, tokenVersion: { increment: 1 } },
      }),
      prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId, usedAt: null } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError("Failed to confirm password reset", error);
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { apiError, handleRouteError, parseJsonBody, validationError } from "@/lib/api/responses";
import { checkRateLimit, getClientIp, rateLimitedResponse } from "@/lib/api/rateLimit";
import { emailSchema } from "@/lib/validation/account";
import { escapeHtml, isEmailEnabled, sendEmail } from "@/lib/email";
import { RESET_TOKEN_TTL_MS, newResetToken } from "@/lib/passwordReset";
import { CONTACT_EMAIL, SITE_URL } from "@/lib/site";

const requestSchema = z.object({ email: emailSchema });

/** Por IP: frena a quien prueba correos al azar. Por email: frena el acoso a una bandeja. */
const IP_LIMIT = { name: "password-reset-ip", limit: 10, windowMs: 60 * 60 * 1000 };
const EMAIL_LIMIT = { name: "password-reset-email", limit: 3, windowMs: 60 * 60 * 1000 };

/** Lo mismo exista o no la cuenta: la respuesta no debe revelar quién está registrado. */
const genericOk = () =>
  NextResponse.json({
    success: true,
    message: "Si hay una cuenta con ese email, te hemos mandado un enlace para crear una contraseña nueva.",
  });

/**
 * POST /api/auth/password-reset — manda el enlace de recuperación.
 *
 * No existía: perder la contraseña era perder la cuenta (Andrea, Tomás y
 * Pedro en la ronda 2).
 */
export async function POST(request: Request) {
  if (!isEmailEnabled()) {
    return apiError(
      `La recuperación por correo no está disponible ahora mismo. Escríbenos a ${CONTACT_EMAIL} y te ayudamos.`,
      503,
    );
  }

  const ipQuota = checkRateLimit(getClientIp(request), IP_LIMIT);
  if (!ipQuota.allowed) return rateLimitedResponse(ipQuota);

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;
  const parsed = requestSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);
  const { email } = parsed.data;

  const emailQuota = checkRateLimit(email, EMAIL_LIMIT);
  if (!emailQuota.allowed) return genericOk();

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true } });
    if (!user) return genericOk();

    const { token, tokenHash } = newResetToken();
    await prisma.$transaction([
      // Un enlace nuevo invalida los anteriores sin usar.
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
      prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
      }),
    ]);

    const link = `${SITE_URL}/recuperar/${token}`;
    const name = escapeHtml(user.name);
    await sendEmail({
      to: email,
      subject: "Crea una contraseña nueva para Pixela",
      text: `Hola, ${user.name}:\n\nPara crear una contraseña nueva entra en este enlace (caduca en una hora y solo sirve una vez):\n${link}\n\nSi no lo has pedido tú, ignora este correo: tu contraseña no cambia.\n\nPixela`,
      html: `<p>Hola, ${name}:</p><p>Para crear una contraseña nueva pulsa en este enlace. Caduca en una hora y solo sirve una vez.</p><p><a href="${link}">Crear una contraseña nueva</a></p><p>Si no lo has pedido tú, ignora este correo: tu contraseña no cambia.</p><p>Pixela</p>`,
    });

    return genericOk();
  } catch (error) {
    return handleRouteError("Failed to start password reset", error);
  }
}

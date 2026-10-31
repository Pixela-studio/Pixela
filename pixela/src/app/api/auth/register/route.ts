import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  apiError,
  handleRouteError,
  parseJsonBody,
  validationError,
} from "@/lib/api/responses";
import {
  checkRateLimit,
  getClientIp,
  peekRateLimit,
  rateLimitedResponse,
} from "@/lib/api/rateLimit";
import { emailSchema, nameSchema, passwordSchema } from "@/lib/validation/account";

const BCRYPT_ROUNDS = 12;

/** Altas creadas por IP y hora: frena la creación masiva de cuentas. */
const REGISTER_LIMIT = { name: "register", limit: 5, windowMs: 60 * 60 * 1000 };

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  /*
   * Aceptar las condiciones y declarar la edad mínima no es opcional: sin eso
   * no hay base para tratar los datos (art. 6.1.b RGPD y art. 7 LOPDGDD). Se
   * comprueba aquí y no solo con la casilla, porque la API se puede llamar sin
   * pasar por el formulario.
   */
  accept_terms: z.literal(true, "Tienes que aceptar las condiciones y la política de privacidad."),
});

export async function POST(request: Request) {
  /*
   * El cupo se consulta al entrar y se gasta solo cuando la cuenta se crea.
   * Antes se gastaba en cada intento, también en los que fallaban por un nombre
   * con tilde o un email repetido: cinco errores de tecleo en un aula y nadie
   * más podía registrarse en una hora desde esa red.
   */
  const ip = getClientIp(request);
  const quota = peekRateLimit(ip, REGISTER_LIMIT);
  if (!quota.allowed) return rateLimitedResponse(quota);

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parseResult = registerSchema.safeParse(body.data);
  if (!parseResult.success) return validationError(parseResult.error);

  const { name, email, password } = parseResult.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return apiError("Este email ya está registrado.", 409);
    }

    await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, BCRYPT_ROUNDS),
        termsAcceptedAt: new Date(),
      },
      select: { id: true },
    });

    checkRateLimit(ip, REGISTER_LIMIT);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    // Carrera entre el findUnique y el create: dos altas simultáneas con el
    // mismo email chocan contra el índice único.
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return apiError("Este email ya está registrado.", 409);
    }
    return handleRouteError("Registration failed", error);
  }
}

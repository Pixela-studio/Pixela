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
import { enforceRateLimit } from "@/lib/api/rateLimit";

const BCRYPT_ROUNDS = 12;

/** Altas permitidas por IP y hora: frena la creación masiva de cuentas. */
const REGISTER_LIMIT = { name: "register", limit: 5, windowMs: 60 * 60 * 1000 };

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres")
    .regex(
      /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/,
      "El nombre solo puede contener letras, números y los caracteres . _ - (sin espacios ni caracteres especiales)",
    ),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña es demasiado larga"),
});

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, REGISTER_LIMIT);
  if (limited) return limited;

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
      },
      select: { id: true },
    });

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

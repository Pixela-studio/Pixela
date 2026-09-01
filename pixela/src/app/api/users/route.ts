import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api/guards";
import {
  apiError,
  handleRouteError,
  parseJsonBody,
  validationError,
} from "@/lib/api/responses";

/**
 * Coste de bcrypt. 10 era el valor por defecto heredado; 12 es la recomendación
 * actual de OWASP y sigue siendo asumible (~250 ms) para el volumen de esta app.
 */
const BCRYPT_ROUNDS = 12;

const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres")
    .regex(
      /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/,
      "El nombre solo puede contener letras, números y los caracteres . _ -",
    ),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128),
  is_admin: z
    .preprocess((value) => (typeof value === "string" ? value === "true" : value), z.boolean())
    .optional()
    .default(false),
});

/**
 * GET /api/users — listado de usuarios.
 *
 * Antes bastaba con estar autenticado: cualquier cuenta registrada podía volcar
 * el email de todos los usuarios de la plataforma. Ahora exige rol de admin,
 * que es lo que la UI ya asumía al ocultar la pestaña.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        photoUrl: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        user_id: user.id,
        name: user.name,
        email: user.email,
        photo_url: user.photoUrl,
        is_admin: user.isAdmin,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    return handleRouteError("Failed to list users", error);
  }
}

/**
 * POST /api/users — alta manual de usuarios desde el panel de administración.
 *
 * Escalada de privilegios corregida: el handler anterior solo pedía sesión y
 * aceptaba `is_admin: true` del body, de modo que cualquier usuario registrado
 * podía crearse una cuenta de administrador.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = createUserSchema.safeParse(body.data);
  if (!parsed.success) return validationError(parsed.error);

  const { name, email, password, is_admin } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return apiError("Este email ya está registrado.", 409);
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, BCRYPT_ROUNDS),
        isAdmin: is_admin,
      },
      select: { id: true, name: true, email: true, isAdmin: true },
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          user_id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          is_admin: newUser.isAdmin,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError("Failed to create user", error);
  }
}

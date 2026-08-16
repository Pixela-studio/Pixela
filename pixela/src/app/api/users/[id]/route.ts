import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import {
  apiError,
  handleRouteError,
  parseJsonBody,
  validationError,
} from "@/lib/api/responses";
import { resourceIdSchema } from "@/lib/api/schemas";

const BCRYPT_ROUNDS = 12;

/**
 * Las fotos de perfil se guardan como data URI base64 en una columna TEXT
 * (deuda técnica conocida). Sin cota, un PUT podía escribir megabytes por
 * usuario. 300×300 JPEG al 70 % ronda los 30 KB; 512 KB deja margen de sobra.
 */
const MAX_IMAGE_PAYLOAD = 512 * 1024;

/**
 * Solo `https:` y data URIs de imagen.
 *
 * `z.string().url()` aceptaba también `javascript:` y `http:` — el primero es un
 * esquema activo y el segundo degrada la página a contenido mixto.
 */
const imageSourceSchema = z
  .string()
  .max(MAX_IMAGE_PAYLOAD, "La imagen es demasiado grande")
  .refine(
    (value) =>
      value === "" ||
      value.startsWith("https://") ||
      /^data:image\/(png|jpe?g|webp|gif);base64,/i.test(value),
    "La imagen debe ser una URL https o una imagen embebida válida",
  );

const userUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder los 50 caracteres")
    .regex(
      /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*$/,
      "El nombre solo puede contener letras, números y los caracteres . _ - (sin espacios ni caracteres especiales)",
    )
    .optional(),
  email: z.string().trim().toLowerCase().email("Email inválido").optional(),
  photo_url: imageSourceSchema.optional(),
  cover_url: imageSourceSchema.optional(),
  is_admin: z
    .preprocess((value) => (typeof value === "string" ? value === "true" : value), z.boolean())
    .optional(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "La contraseña es demasiado larga")
    .optional(),
  current_password: z.string().max(128).optional(),
});

interface UpdateUserData {
  name?: string;
  email?: string;
  photoUrl?: string;
  coverImage?: string;
  isAdmin?: boolean;
  password?: string;
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const parsedId = resourceIdSchema.safeParse(params.id);
  if (!parsedId.success) {
    return apiError("ID inválido", 400);
  }
  const id = parsedId.data;

  const guard = await requireUser();
  if (!guard.ok) return guard.response;
  const { id: currentUserId, isAdmin } = guard.user;

  // Solo el propio usuario o un admin pueden editar.
  if (currentUserId !== id && !isAdmin) {
    return apiError("No tienes permiso para editar este perfil", 403);
  }

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parseResult = userUpdateSchema.safeParse(body.data);
  if (!parseResult.success) return validationError(parseResult.error);

  const { name, email, photo_url, cover_url, is_admin, password, current_password } =
    parseResult.data;

  try {
    const updateData: UpdateUserData = {};

    if (name) updateData.name = name;
    if (photo_url !== undefined) updateData.photoUrl = photo_url;
    if (cover_url !== undefined) updateData.coverImage = cover_url;

    // Solo un admin puede tocar el flag de rol.
    if (isAdmin && is_admin !== undefined) {
      // Un admin no puede degradarse a sí mismo: evita quedarse sin acceso al panel.
      if (currentUserId === id && is_admin === false) {
        return apiError("No puedes retirarte a ti mismo el rol de administrador", 400);
      }
      updateData.isAdmin = is_admin;
    }

    if (email) {
      const emailOwner = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      // Antes esto se delegaba a Prisma: el P2002 subía como 500 con el mensaje
      // crudo del constraint, filtrando el nombre del índice.
      if (emailOwner && emailOwner.id !== id) {
        return apiError("Ese email ya está en uso", 409);
      }

      updateData.email = email;
    }

    if (password) {
      // Cambiar la contraseña propia exige demostrar que se conoce la actual.
      // Sin esto, una sesión secuestrada bastaba para expulsar al dueño de su cuenta.
      if (currentUserId === id) {
        const account = await prisma.user.findUnique({
          where: { id },
          select: { password: true },
        });

        if (!account?.password) {
          return apiError("Esta cuenta no tiene contraseña configurada", 400);
        }

        if (!current_password) {
          return apiError("Debes indicar tu contraseña actual", 400);
        }

        const matches = await bcrypt.compare(current_password, account.password);
        if (!matches) {
          return apiError("La contraseña actual no es correcta", 403);
        }
      }

      updateData.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    if (Object.keys(updateData).length === 0) {
      return apiError("No hay cambios que aplicar", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        photoUrl: true,
        coverImage: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      // `passwordChanged` deja que el cliente decida si debe cerrar sesión.
      passwordChanged: Boolean(password),
      user: {
        user_id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        photo_url: updatedUser.photoUrl,
        cover_url: updatedUser.coverImage,
        is_admin: updatedUser.isAdmin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    return handleRouteError("Failed to update user", error, { userId: id });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const parsedId = resourceIdSchema.safeParse(params.id);
  if (!parsedId.success) {
    return apiError("ID inválido", 400);
  }
  const id = parsedId.data;

  const guard = await requireUser();
  if (!guard.ok) return guard.response;
  const { id: currentUserId, isAdmin } = guard.user;

  if (currentUserId !== id && !isAdmin) {
    return apiError("No tienes permiso para eliminar este perfil", 403);
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { isAdmin: true },
    });

    if (!target) {
      return apiError("Usuario no encontrado", 404);
    }

    // No dejar la plataforma sin ningún administrador.
    if (target.isAdmin) {
      const adminCount = await prisma.user.count({ where: { isAdmin: true } });
      if (adminCount <= 1) {
        return apiError("No puedes eliminar al único administrador", 400);
      }
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError("Failed to delete user", error, { userId: id });
  }
}

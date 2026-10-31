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
import { reviewPathsOf, revalidatePaths } from "@/lib/api/reviewsQuery";
import { emailSchema, nameSchema, passwordSchema } from "@/lib/validation/account";

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
  name: nameSchema.optional(),
  email: emailSchema.optional(),
  photo_url: imageSourceSchema.optional(),
  cover_url: imageSourceSchema.optional(),
  is_admin: z
    .preprocess((value) => (typeof value === "string" ? value === "true" : value), z.boolean())
    .optional(),
  password: passwordSchema.optional(),
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

const deleteUserSchema = z.object({
  current_password: z.string().max(128).optional(),
});

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

    /*
     * Cambiar el correo o la contraseña de la propia cuenta exige la contraseña
     * actual. Antes solo la pedía la contraseña: con una sesión robada bastaba
     * cambiar el correo para quedarse la cuenta, y con recuperación por correo
     * eso sería definitivo.
     */
    const current = await prisma.user.findUnique({
      where: { id },
      select: { email: true, password: true },
    });
    if (!current) {
      return apiError("Usuario no encontrado", 404);
    }

    const emailChanges = Boolean(email) && email !== current.email;

    if ((emailChanges || password) && currentUserId === id) {
      if (!current.password) {
        return apiError("Esta cuenta no tiene contraseña configurada", 400);
      }

      if (!current_password) {
        return apiError(
          emailChanges
            ? "Escribe tu contraseña actual para cambiar el email"
            : "Debes indicar tu contraseña actual",
          400,
        );
      }

      const matches = await bcrypt.compare(current_password, current.password);
      if (!matches) {
        return apiError("La contraseña actual no es correcta", 403);
      }
    }

    if (email && emailChanges) {
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
      updateData.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    // Cambiar la contraseña cierra todas las sesiones abiertas, también las de
    // otros dispositivos: `auth.ts` rechaza los tokens con la versión anterior.
    const revokeSessions = Boolean(password);

    if (Object.keys(updateData).length === 0) {
      return apiError("No hay cambios que aplicar", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: revokeSessions ? { ...updateData, tokenVersion: { increment: 1 } } : updateData,
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

    // El nombre y la foto salen en las reseñas de las fichas cacheadas.
    if (updateData.name !== undefined || updateData.photoUrl !== undefined) {
      revalidatePaths(await reviewPathsOf(id));
    }

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

  // El cuerpo es opcional: un admin que borra a otro usuario no manda nada.
  let currentPassword: string | undefined;
  if (request.headers.get("content-type")?.includes("application/json")) {
    const body = await parseJsonBody(request);
    if (!body.ok) return body.response;
    const parsed = deleteUserSchema.safeParse(body.data);
    if (!parsed.success) return validationError(parsed.error);
    currentPassword = parsed.data.current_password;
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { isAdmin: true, password: true },
    });

    if (!target) {
      return apiError("Usuario no encontrado", 404);
    }

    // Borrar la propia cuenta es irreversible: se pide la contraseña, como al
    // cambiar el email o la contraseña.
    if (currentUserId === id && target.password) {
      if (!currentPassword) {
        return apiError("Escribe tu contraseña para eliminar la cuenta", 400);
      }
      if (!(await bcrypt.compare(currentPassword, target.password))) {
        return apiError("La contraseña no es correcta", 403);
      }
    }

    // No dejar la plataforma sin ningún administrador.
    if (target.isAdmin) {
      const adminCount = await prisma.user.count({ where: { isAdmin: true } });
      if (adminCount <= 1) {
        return apiError("No puedes eliminar al único administrador", 400);
      }
    }

    // Las rutas se leen antes de borrar: el borrado en cascada se lleva las
    // reseñas y con ellas la lista de fichas que hay que invalidar.
    const reviewPaths = await reviewPathsOf(id);

    await prisma.user.delete({ where: { id } });

    revalidatePaths(reviewPaths);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError("Failed to delete user", error, { userId: id });
  }
}

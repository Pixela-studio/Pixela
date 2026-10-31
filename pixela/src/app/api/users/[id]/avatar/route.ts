import prisma from "@/lib/prisma";
import { apiError, handleRouteError } from "@/lib/api/responses";
import { resourceIdSchema } from "@/lib/api/schemas";

const DATA_URI = /^data:(image\/(?:png|jpe?g|webp|gif));base64,(.+)$/i;

/**
 * Foto de perfil de quien firma reseñas, servida como imagen.
 *
 * Las fotos se guardan como data URI en `users.photo_url` (deuda conocida, ver
 * CLAUDE.md). Antes viajaban incrustadas en el HTML de cada ficha con
 * reseñas: hasta 512 KB por autor en una página ISR que se descarga entera,
 * también con 3G. Ahora la ficha lleva solo esta URL, con `?v=` para que el
 * navegador y la CDN la guarden hasta que el usuario cambie de foto.
 *
 * Solo se sirve la foto de quien tiene alguna reseña, que es la que ya es
 * pública. Recorrer ids no descubre la foto de nadie más.
 */
export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await props.params;
  const parsedId = resourceIdSchema.safeParse(rawId);
  if (!parsedId.success) return apiError("ID inválido", 400);

  try {
    const user = await prisma.user.findFirst({
      where: { id: parsedId.data, reviews: { some: {} } },
      select: { photoUrl: true },
    });

    const match = user?.photoUrl?.match(DATA_URI);
    if (!match) return apiError("Sin foto", 404);

    const [, contentType, base64] = match;
    return new Response(Buffer.from(base64, "base64"), {
      headers: {
        "Content-Type": contentType.toLowerCase(),
        // La URL cambia con `?v=` cuando cambia la foto: se puede cachear largo.
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return handleRouteError("Failed to serve avatar", error, { userId: parsedId.data });
  }
}

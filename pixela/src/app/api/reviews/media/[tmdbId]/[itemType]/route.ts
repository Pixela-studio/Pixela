import { NextResponse } from "next/server";
import { apiError, handleRouteError } from "@/lib/api/responses";
import { itemTypeSchema, tmdbIdSchema } from "@/lib/api/schemas";
import { getMediaReviews } from "@/lib/api/reviewsQuery";

/**
 * GET /api/reviews/media/:tmdbId/:itemType — reseñas públicas de un título.
 *
 * La ficha ya no llama aquí al montar: sus reseñas llegan renderizadas desde el
 * Server Component vía `getMediaReviews`. Esta ruta queda para el refresco del
 * cliente después de publicar, editar o borrar, que es cuando de verdad hace
 * falta saltarse la caché ISR de la página.
 *
 * Sin `Cache-Control` a propósito: quien llama aquí lo hace justo porque acaba
 * de cambiar algo y necesita el dato fresco.
 *
 * Bug corregido: `BigInt(params.tmdbId)` se ejecutaba **fuera** del try/catch,
 * así que `/api/reviews/media/abc/movie` lanzaba un SyntaxError sin capturar y
 * devolvía un 500 con traza en lugar de un 400. El `itemType as any` permitía
 * además colar un valor fuera del enum y hacer fallar la query.
 */
export async function GET(
  request: Request,
  props: { params: Promise<{ tmdbId: string; itemType: string }> },
) {
  const params = await props.params;

  const parsedTmdbId = tmdbIdSchema.safeParse(params.tmdbId);
  const parsedItemType = itemTypeSchema.safeParse(params.itemType);

  if (!parsedTmdbId.success || !parsedItemType.success) {
    return apiError("Parámetros inválidos", 400);
  }

  try {
    const data = await getMediaReviews(parsedTmdbId.data, parsedItemType.data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleRouteError("Failed to fetch media reviews", error);
  }
}

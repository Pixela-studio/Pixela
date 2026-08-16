import { NextResponse } from "next/server";
import { z } from "zod";
import { logger } from "@/lib/logger";

/**
 * Respuesta de error uniforme.
 *
 * Nunca propaga `error.message` al cliente: varias rutas devolvían el mensaje
 * crudo de Prisma/TMDB, filtrando nombres de tabla, columnas y rutas internas.
 * El detalle real va al log del servidor.
 */
export function apiError(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

/**
 * Traduce un fallo de validación Zod en un 400 con el primer mensaje legible.
 */
export function validationError(error: z.ZodError) {
  return NextResponse.json(
    {
      success: false,
      error: error.issues[0]?.message ?? "Datos inválidos",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    },
    { status: 400 },
  );
}

/**
 * Parsea el body JSON de forma segura.
 *
 * `await req.json()` lanza si el cuerpo está vacío o malformado; sin este wrapper
 * un `curl -X POST` sin body producía un 500 en vez de un 400.
 */
export async function parseJsonBody(
  request: Request,
): Promise<{ ok: true; data: unknown } | { ok: false; response: NextResponse }> {
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return { ok: false, response: apiError("Cuerpo de la petición inválido", 400) };
  }
}

/**
 * Handler de último recurso: registra el error real y devuelve un mensaje genérico.
 */
export function handleRouteError(
  context: string,
  error: unknown,
  meta?: Record<string, unknown>,
) {
  logger.error(context, error, meta);
  return apiError("Error interno del servidor", 500);
}

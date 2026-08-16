import { z } from "zod";

/**
 * Esquemas compartidos por las route handlers.
 *
 * Antes cada ruta destructuraba el body a pelo (`const { tmdb_id, rating } = body`)
 * y lo pasaba directo a Prisma. Eso permitía enviar ratings fuera de rango,
 * reseñas de tamaño ilimitado o `item_type` arbitrarios que hacían explotar la
 * query con un 500.
 */

/** Un id de TMDB siempre es un entero positivo. */
export const tmdbIdSchema = z.coerce
  .number()
  .int("El id de TMDB debe ser un entero")
  .positive("El id de TMDB debe ser positivo")
  .max(Number.MAX_SAFE_INTEGER);

/** Tipos de contenido soportados (coincide con el enum `ItemType` de Prisma). */
export const itemTypeSchema = z.enum(["movie", "series"], {
  message: "El tipo debe ser 'movie' o 'series'",
});

/** Estados de la biblioteca (coincide con el enum `WatchStatus` de Prisma). */
export const watchStatusSchema = z.enum(
  ["PLAN_TO_WATCH", "WATCHING", "COMPLETED", "DROPPED"],
  { message: "Estado de biblioteca inválido" },
);

/** Página de un listado paginado de TMDB (la API rechaza page > 500). */
export const pageSchema = z.coerce.number().int().min(1).max(500).catch(1);

/** Un id numérico de recurso propio (fila de Postgres). */
export const resourceIdSchema = z.coerce
  .number()
  .int("Identificador inválido")
  .positive("Identificador inválido");

/**
 * Longitud máxima de una reseña. Sin este límite el campo `TEXT` aceptaba
 * payloads de megabytes, lo que es un vector de agotamiento de almacenamiento.
 */
export const REVIEW_MAX_LENGTH = 2000;

export const createReviewSchema = z.object({
  tmdb_id: tmdbIdSchema,
  item_type: itemTypeSchema,
  rating: z.coerce
    .number()
    .min(0, "La puntuación mínima es 0")
    .max(10, "La puntuación máxima es 10")
    // Decimal(3,1) en Postgres: una sola posición decimal.
    .transform((value) => Math.round(value * 10) / 10),
  review: z
    .string()
    .trim()
    .max(REVIEW_MAX_LENGTH, `La reseña no puede exceder los ${REVIEW_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
});

export const updateReviewSchema = createReviewSchema
  .pick({ rating: true, review: true })
  .partial()
  .refine(
    (data) => data.rating !== undefined || data.review !== undefined,
    { message: "No hay nada que actualizar" },
  );

export const createFavoriteSchema = z.object({
  tmdb_id: tmdbIdSchema,
  item_type: itemTypeSchema,
});

export const createLibraryItemSchema = z.object({
  tmdb_id: tmdbIdSchema,
  item_type: itemTypeSchema,
  status: watchStatusSchema.optional(),
});

export const updateLibraryItemSchema = z.object({
  status: watchStatusSchema,
});

/**
 * Parámetros de `/discover` que se permiten reenviar a TMDB.
 *
 * Las rutas de discover hacían `searchParams.forEach(...)` y reenviaban **todo**
 * a TMDB. Eso dejaba que el cliente forzara `include_adult=true`, sobrescribiera
 * `api_key` o `language`, y convertía el proxy en un pass-through arbitrario.
 */
export const ALLOWED_DISCOVER_PARAMS = new Set([
  "page",
  "sort_by",
  "with_genres",
  "without_genres",
  "with_original_language",
  "with_watch_providers",
  "watch_region",
  "primary_release_year",
  "primary_release_date.gte",
  "primary_release_date.lte",
  "first_air_date_year",
  "first_air_date.gte",
  "first_air_date.lte",
  "vote_average.gte",
  "vote_average.lte",
  "vote_count.gte",
  "with_runtime.gte",
  "with_runtime.lte",
  "year",
]);

/**
 * Filtra los query params de entrada dejando solo los de la allowlist.
 */
export function pickDiscoverParams(
  searchParams: URLSearchParams,
): Record<string, string> {
  const params: Record<string, string> = {};

  for (const [key, value] of searchParams.entries()) {
    if (!ALLOWED_DISCOVER_PARAMS.has(key)) continue;
    // Cota defensiva: TMDB no necesita valores largos y evita URLs gigantes.
    if (value.length > 200) continue;
    params[key] = value;
  }

  return params;
}

/** Longitud máxima de una búsqueda; TMDB ignora cadenas mayores igualmente. */
export const searchQuerySchema = z
  .string()
  .trim()
  .min(1, "La búsqueda no puede estar vacía")
  .max(200, "La búsqueda es demasiado larga");

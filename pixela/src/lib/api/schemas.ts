import { z } from "zod";
import { REVIEW_MAX_LENGTH } from "@/lib/constants/reviews";

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

/*
 * La longitud máxima vive en `@/lib/constants/reviews` para que el formulario
 * del cliente valide exactamente el mismo límite que aplica el servidor. Sin
 * este tope el campo `TEXT` aceptaba payloads de megabytes.
 */
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
  /** «Solo para mí». Por defecto, pública. */
  is_public: z.boolean().optional(),
});

export const updateReviewSchema = createReviewSchema
  .pick({ rating: true, review: true, is_public: true })
  .partial()
  .refine(
    (data) => data.rating !== undefined || data.review !== undefined || data.is_public !== undefined,
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
  "with_watch_monetization_types",
  "watch_region",
  // Edad recomendada (solo películas en TMDB): filtro «Para ver en familia».
  "certification_country",
  "certification.lte",
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

/* ── Listas ──────────────────────────────────────────────────────────────── */

export const listVisibilitySchema = z.enum(["PRIVATE", "LINK", "PUBLIC"]);

export const createListSchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre a la lista").max(80, "El nombre es demasiado largo"),
  description: z.string().trim().max(500, "La descripción es demasiado larga").optional(),
  visibility: listVisibilitySchema.optional(),
});

export const updateListSchema = createListSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: "No hay nada que actualizar" });

export const addListItemSchema = z.object({
  tmdb_id: tmdbIdSchema,
  item_type: itemTypeSchema,
  note: z.string().trim().max(280, "La nota es demasiado larga").optional(),
});

/** El orden completo de la lista: ids de sus elementos de arriba abajo. */
export const reorderListSchema = z.object({
  item_ids: z.array(resourceIdSchema).min(1).max(500),
});

/* ── Diario y capítulos ──────────────────────────────────────────────────── */

/** Fecha `AAAA-MM-DD`, no futura y no anterior a 1900. */
const watchedOnSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida")
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.getUTCFullYear() >= 1900 && date.getTime() <= Date.now() + 86_400_000;
  }, "La fecha no puede ser futura");

export const createDiaryEntrySchema = z.object({
  tmdb_id: tmdbIdSchema,
  item_type: itemTypeSchema,
  watched_on: watchedOnSchema,
  rating: z.coerce
    .number()
    .min(0)
    .max(10)
    .transform((value) => Math.round(value * 10) / 10)
    .nullable()
    .optional(),
  note: z.string().trim().max(500, "La nota es demasiado larga").optional(),
  /** Si no se indica, se deduce: revisionado si ya hay otra entrada del título. */
  rewatch: z.boolean().optional(),
  /** Marcar además el título como «Completado» en la biblioteca. */
  mark_completed: z.boolean().optional(),
});

export const episodeToggleSchema = z.object({
  tmdb_id: tmdbIdSchema,
  season: z.coerce.number().int().min(0).max(200),
  /** Uno o varios capítulos de la misma temporada (marcar la temporada entera). */
  episodes: z.array(z.coerce.number().int().min(1).max(5000)).min(1).max(500),
  watched: z.boolean(),
});

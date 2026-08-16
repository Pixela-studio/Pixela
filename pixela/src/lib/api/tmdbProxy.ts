import { NextResponse } from "next/server";
import { fetchFromTmdb } from "@/lib/tmdb";
import { apiError, handleRouteError } from "@/lib/api/responses";
import {
  pageSchema,
  pickDiscoverParams,
  searchQuerySchema,
  tmdbIdSchema,
} from "@/lib/api/schemas";

/**
 * Handlers compartidos del proxy a TMDB.
 *
 * `/api/movies/*` y `/api/series/*` eran diez ficheros con el mismo cuerpo
 * copiado, diferenciados solo por `"movie"` vs `"tv"` y el texto del error.
 */

/** Tipo tal y como lo usa la app en las URLs. */
export type PixelaMediaType = "movies" | "series";

/** Tipo tal y como lo espera TMDB. */
export type TmdbMediaType = "movie" | "tv";

export const toTmdbType = (type: string): TmdbMediaType =>
  type === "series" || type === "tv" ? "tv" : "movie";

interface TmdbListResponse {
  results?: unknown[];
  page?: number;
  total_pages?: number;
  total_results?: number;
}

const listResponse = (data: TmdbListResponse) =>
  NextResponse.json({
    success: true,
    data: data.results ?? [],
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  });

/**
 * Valida un id de TMDB antes de interpolarlo en la ruta del proxy.
 *
 * Las rutas de detalle hacían `fetchFromTmdb(\`/movie/${id}\`)` con el segmento
 * crudo. Como Next decodifica los parámetros, una petición a
 * `/api/movies/%2E%2E%2F%2E%2E%2Faccount` llegaba como `../../account` y el
 * constructor `URL` normalizaba el `..`, convirtiendo el proxy en un puente a
 * endpoints arbitrarios de TMDB con nuestra API key.
 */
export function parseTmdbId(rawId: string): number | null {
  const parsed = tmdbIdSchema.safeParse(rawId);
  return parsed.success ? parsed.data : null;
}

/** GET /discover/{movie|tv} */
export async function proxyDiscover(request: Request, type: PixelaMediaType) {
  const { searchParams } = new URL(request.url);
  const tmdbType = toTmdbType(type);

  // Allowlist: antes se reenviaba a TMDB **todo** query param recibido, lo que
  // permitía al cliente forzar `include_adult=true` o sobrescribir `language`.
  const params = pickDiscoverParams(searchParams);
  params.page = String(pageSchema.parse(searchParams.get("page") ?? "1"));
  params.include_adult = "false";

  try {
    const data = await fetchFromTmdb<TmdbListResponse>(
      `/discover/${tmdbType}`,
      params,
    );
    return listResponse(data);
  } catch (error) {
    return handleRouteError(`Failed to discover ${type}`, error);
  }
}

/** GET /search/{movie|tv} */
export async function proxySearch(request: Request, type: PixelaMediaType) {
  const { searchParams } = new URL(request.url);

  const parsedQuery = searchQuerySchema.safeParse(searchParams.get("query") ?? "");
  if (!parsedQuery.success) {
    return apiError(parsedQuery.error.issues[0].message, 400);
  }

  try {
    const data = await fetchFromTmdb<TmdbListResponse>(
      `/search/${toTmdbType(type)}`,
      {
        query: parsedQuery.data,
        page: pageSchema.parse(searchParams.get("page") ?? "1"),
        include_adult: false,
      },
    );
    return listResponse(data);
  } catch (error) {
    return handleRouteError(`Failed to search ${type}`, error);
  }
}

/** GET /trending/{movie|tv}/week */
export async function proxyTrending(request: Request, type: PixelaMediaType) {
  const { searchParams } = new URL(request.url);

  try {
    const data = await fetchFromTmdb<TmdbListResponse>(
      `/trending/${toTmdbType(type)}/week`,
      { page: pageSchema.parse(searchParams.get("page") ?? "1") },
    );
    // Este endpoint devuelve solo `data`: el front de tendencias lee `data.data`.
    return NextResponse.json({ success: true, data: data.results ?? [] });
  } catch (error) {
    return handleRouteError(`Failed to fetch trending ${type}`, error);
  }
}

/** GET /discover/{movie|tv} filtrado por género. */
export async function proxyGenre(
  request: Request,
  type: PixelaMediaType,
  rawGenreId: string,
) {
  const genreId = parseTmdbId(rawGenreId);
  if (genreId === null) {
    return apiError("Género inválido", 400);
  }

  const { searchParams } = new URL(request.url);

  try {
    const data = await fetchFromTmdb<TmdbListResponse>(
      `/discover/${toTmdbType(type)}`,
      {
        page: pageSchema.parse(searchParams.get("page") ?? "1"),
        with_genres: genreId,
        sort_by: "popularity.desc",
        include_adult: false,
      },
    );
    return listResponse(data);
  } catch (error) {
    return handleRouteError("Failed to fetch genre content", error, {
      type,
      genreId,
    });
  }
}

/** GET /{movie|tv}/{id} con todo lo que la ficha necesita. */
export async function proxyDetails(type: PixelaMediaType, rawId: string) {
  const id = parseTmdbId(rawId);
  if (id === null) {
    return apiError("Identificador inválido", 400);
  }

  try {
    const data = await fetchFromTmdb(`/${toTmdbType(type)}/${id}`, {
      append_to_response: "credits,videos,images,similar,watch/providers",
      include_image_language: "en,null,es",
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }
    return handleRouteError(`Failed to fetch ${type} details`, error, { id });
  }
}

/** GET /{movie|tv}/{id}/images */
export async function proxyImages(type: PixelaMediaType, rawId: string) {
  const id = parseTmdbId(rawId);
  if (id === null) {
    return apiError("Identificador inválido", 400);
  }

  try {
    const data = await fetchFromTmdb(`/${toTmdbType(type)}/${id}/images`);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json(
        { success: false, message: "Not found" },
        { status: 404 },
      );
    }
    return handleRouteError(`Failed to fetch ${type} images`, error, { id });
  }
}

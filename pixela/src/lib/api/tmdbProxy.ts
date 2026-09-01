import { NextResponse } from "next/server";
import { fetchFromTmdb } from "@/lib/tmdb";
import { apiError, handleRouteError } from "@/lib/api/responses";
import {
  fetchTmdbDetail,
  parseTmdbId,
  toTmdbType,
  type PixelaMediaType,
} from "@/lib/api/tmdbDetails";
import {
  pageSchema,
  pickDiscoverParams,
  searchQuerySchema,
} from "@/lib/api/schemas";
import { enforceRateLimit } from "@/lib/api/rateLimit";

/**
 * Límite de la búsqueda.
 *
 * El resto del proxy se cachea por URL, así que un cliente insistente golpea la
 * CDN y no la función. La búsqueda no: el espacio de consultas es infinito, cada
 * término nuevo es un fallo de caché garantizado y por tanto una invocación más
 * una llamada a TMDB. Es el endpoint que un scraper usaría para vaciar el
 * catálogo.
 *
 * 30 consultas por minuto y por IP dan de sobra para escribir en el buscador
 * (el formulario ya aplica 500 ms de debounce) y cortan el uso automatizado.
 */
const SEARCH_LIMIT = {
  name: "tmdb-search",
  limit: 30,
  windowMs: 60_000,
} as const;

export { parseTmdbId, toTmdbType } from "@/lib/api/tmdbDetails";
export type { PixelaMediaType, TmdbMediaType } from "@/lib/api/tmdbDetails";

/**
 * Caché de las respuestas del proxy en la CDN de Vercel.
 *
 * Ninguna de estas rutas llevaba `Cache-Control`, así que cada llamada —de la
 * app, de un rastreador o de alguien recargando— despertaba la función y salía
 * a TMDB. El contenido es un catálogo público que cambia a diario: una hora de
 * frescura sobra.
 *
 * `s-maxage` deja que la CDN responda sin invocar nada; `stale-while-revalidate`
 * evita que la primera petición tras la expiración pague la espera.
 */
const CDN_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
} as const;

/**
 * Handlers compartidos del proxy a TMDB.
 *
 * `/api/movies/*` y `/api/series/*` eran diez ficheros con el mismo cuerpo
 * copiado, diferenciados solo por `"movie"` vs `"tv"` y el texto del error.
 */

interface TmdbListResponse {
  results?: unknown[];
  page?: number;
  total_pages?: number;
  total_results?: number;
}

const listResponse = (data: TmdbListResponse) =>
  NextResponse.json(
    {
      success: true,
      data: data.results ?? [],
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    },
    { headers: CDN_CACHE_HEADERS },
  );

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
  const limited = enforceRateLimit(request, SEARCH_LIMIT);
  if (limited) return limited;

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
    return NextResponse.json(
      { success: true, data: data.results ?? [] },
      { headers: CDN_CACHE_HEADERS },
    );
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
    // Misma llamada que usan los Server Components de las fichas, para que la
    // Data Cache de Next la comparta en vez de duplicarla.
    const data = await fetchTmdbDetail(toTmdbType(type), id);
    return NextResponse.json(
      { success: true, data },
      { headers: CDN_CACHE_HEADERS },
    );
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
    return NextResponse.json(data, { headers: CDN_CACHE_HEADERS });
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

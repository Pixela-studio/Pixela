import { API_ENDPOINTS } from "../shared/apiEndpoints";
import { ApiError, fetchFromAPI, parseApiErrorMessage } from "../shared/apiHelpers";

/** Resultado de `search/multi` tal como lo devuelve TMDB. */
interface RawMultiResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  known_for_department?: string;
  known_for?: Array<{ title?: string; name?: string }>;
}

interface MultiSearchResponse {
  success: boolean;
  data: RawMultiResult[];
  page: number;
  total_pages: number;
  total_results: number;
}

export interface SearchTitle {
  kind: "movie" | "series";
  id: number;
  title: string;
  originalTitle?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  date: string;
  overview: string;
}

export interface SearchPerson {
  kind: "person";
  id: number;
  name: string;
  profile_path: string | null;
  /** Oficio principal, ya en castellano. */
  department?: string;
  /** Dos o tres títulos por los que se la conoce. */
  knownFor: string[];
}

export type SearchResult = SearchTitle | SearchPerson;

export interface SearchPage {
  /** En el orden de relevancia de TMDB, mezclando tipos. */
  results: SearchResult[];
  page: number;
  totalPages: number;
  totalResults: number;
}

/** Oficios de TMDB (`known_for_department`) en castellano. */
export const DEPARTMENTS: Record<string, string> = {
  Acting: "Interpretación",
  Directing: "Dirección",
  Writing: "Guion",
  Production: "Producción",
  Camera: "Fotografía",
  Editing: "Montaje",
  Sound: "Sonido",
  Art: "Dirección de arte",
  "Costume & Make-Up": "Vestuario y maquillaje",
  "Visual Effects": "Efectos visuales",
  Crew: "Equipo",
  Lighting: "Iluminación",
  Creator: "Creación",
};

function normalize(item: RawMultiResult): SearchResult {
  if (item.media_type === "person") {
    return {
      kind: "person",
      id: item.id,
      name: item.name ?? "",
      profile_path: item.profile_path ?? null,
      department: item.known_for_department
        ? DEPARTMENTS[item.known_for_department] ?? item.known_for_department
        : undefined,
      knownFor: (item.known_for ?? [])
        .map((work) => work.title ?? work.name ?? "")
        .filter(Boolean)
        .slice(0, 3),
    };
  }

  const title = item.title ?? item.name ?? "";
  const original = item.original_title ?? item.original_name;
  return {
    kind: item.media_type === "movie" ? "movie" : "series",
    id: item.id,
    title,
    originalTitle: original && original !== title ? original : undefined,
    poster_path: item.poster_path ?? null,
    backdrop_path: item.backdrop_path ?? null,
    vote_average: item.vote_average ?? 0,
    vote_count: item.vote_count ?? 0,
    date: item.release_date ?? item.first_air_date ?? "",
    overview: item.overview ?? "",
  };
}

/**
 * Búsqueda global (`/api/search`): una consulta para películas, series y
 * personas, en orden de relevancia.
 */
export async function searchAll(query: string, page = 1): Promise<SearchPage> {
  const response = await fetchFromAPI<MultiSearchResponse>(
    `${API_ENDPOINTS.SEARCH}?query=${encodeURIComponent(query)}&page=${page}`,
  );
  return {
    results: response.data.map(normalize),
    page: response.page,
    totalPages: Math.min(response.total_pages ?? 1, 500),
    totalResults: response.total_results ?? 0,
  };
}

/**
 * Mensaje para el usuario a partir de un fallo de búsqueda o de catálogo.
 *
 * El 429 salía como «Request failed with status 429».
 */
export function describeSearchError(error: unknown): string {
  if (error instanceof ApiError && error.status === 429) {
    return "Has hecho muchas búsquedas seguidas. Espera un minuto y vuelve a probar.";
  }
  if (error instanceof ApiError && error.status === 400) {
    return parseApiErrorMessage(error, "Esa búsqueda no es válida.");
  }
  if (error instanceof ApiError && error.status >= 500) {
    return "El catálogo no responde ahora mismo. Inténtalo de nuevo en unos segundos.";
  }
  if (error instanceof TypeError) {
    return "No hay conexión. Comprueba tu red y vuelve a intentarlo.";
  }
  return "No se pudo cargar el contenido. Inténtalo de nuevo.";
}

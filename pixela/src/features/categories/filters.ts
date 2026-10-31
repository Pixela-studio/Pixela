/**
 * Filtros del catálogo de Categorías.
 *
 * TMDB ya admitía en `/discover` idioma, fechas, votos, duración, plataformas
 * y edad recomendada (ver `ALLOWED_DISCOVER_PARAMS`), pero la interfaz solo
 * dejaba elegir el género. Aquí vive el modelo: cómo se lee y escribe en la URL
 * y cómo se traduce a parámetros de TMDB.
 */

export type AgeRating = "" | "TP" | "7" | "12" | "16";

export interface CatalogFilters {
  /** Preajuste «Para ver en familia»: familia o animación, edad baja y corta. */
  familia: boolean;
  /** Solo lo incluido en las suscripciones de «Mis plataformas». */
  misPlataformas: boolean;
  /** Edad recomendada máxima en España. TMDB solo lo admite en películas. */
  edad: AgeRating;
  /** Duración máxima en minutos (por episodio en series). 0 = cualquiera. */
  duracion: number;
  /** Código ISO 639-1 del idioma original. "" = cualquiera. */
  idioma: string;
  /** Primer año de la década (1990). 0 = cualquiera. */
  decada: number;
  /** Votos mínimos en TMDB, para que una nota signifique algo. 0 = sin mínimo. */
  votos: number;
}

export const EMPTY_FILTERS: CatalogFilters = {
  familia: false,
  misPlataformas: false,
  edad: "",
  duracion: 0,
  idioma: "",
  decada: 0,
  votos: 0,
};

export const AGE_OPTIONS: Array<{ value: AgeRating; label: string }> = [
  { value: "", label: "Cualquiera" },
  { value: "TP", label: "Todos los públicos" },
  { value: "7", label: "Hasta +7" },
  { value: "12", label: "Hasta +12" },
  { value: "16", label: "Hasta +16" },
];

export const DURATION_OPTIONS = [
  { value: 0, label: "Cualquiera" },
  { value: 30, label: "Menos de 30 min" },
  { value: 90, label: "Menos de 1 h 30 min" },
  { value: 120, label: "Menos de 2 h" },
];

export const LANGUAGE_OPTIONS = [
  { value: "", label: "Cualquiera" },
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "fr", label: "Francés" },
  { value: "it", label: "Italiano" },
  { value: "de", label: "Alemán" },
  { value: "ja", label: "Japonés" },
  { value: "ko", label: "Coreano" },
  { value: "zh", label: "Chino" },
  { value: "pt", label: "Portugués" },
  { value: "sv", label: "Sueco" },
  { value: "da", label: "Danés" },
];

export const DECADE_OPTIONS = [0, 2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950, 1940].map(
  (value) => ({ value, label: value ? `Años ${String(value).slice(2)}` : "Cualquiera" }),
);

export const VOTES_OPTIONS = [
  { value: 0, label: "Sin mínimo" },
  { value: 100, label: "Al menos 100 votos" },
  { value: 1000, label: "Al menos 1.000 votos" },
];

const FAMILY = {
  movies: { genres: "10751|16", age: "7" as AgeRating, duration: 110 },
  series: { genres: "10762|16|10751", duration: 30 },
};

export function countActiveFilters(filters: CatalogFilters): number {
  return (Object.keys(EMPTY_FILTERS) as Array<keyof CatalogFilters>).filter(
    (key) => filters[key] !== EMPTY_FILTERS[key],
  ).length;
}

export const hasActiveFilters = (filters: CatalogFilters) => countActiveFilters(filters) > 0;

/* ── URL ─────────────────────────────────────────────────────────────────── */

const AGE_VALUES: AgeRating[] = ["", "TP", "7", "12", "16"];

const int = (value: string | null, allowed?: number[]) => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isInteger(parsed)) return 0;
  if (allowed && !allowed.includes(parsed)) return 0;
  return parsed;
};

export function readFilters(params: URLSearchParams): CatalogFilters {
  const edad = (params.get("edad") ?? "") as AgeRating;
  const idioma = params.get("idioma") ?? "";
  return {
    familia: params.get("familia") === "1",
    misPlataformas: params.get("plataformas") === "mias",
    edad: AGE_VALUES.includes(edad) ? edad : "",
    duracion: int(params.get("duracion"), DURATION_OPTIONS.map((o) => o.value)),
    idioma: LANGUAGE_OPTIONS.some((o) => o.value === idioma) ? idioma : "",
    decada: int(params.get("decada"), DECADE_OPTIONS.map((o) => o.value)),
    votos: int(params.get("votos"), VOTES_OPTIONS.map((o) => o.value)),
  };
}

export function writeFilters(params: URLSearchParams, filters: CatalogFilters): void {
  if (filters.familia) params.set("familia", "1");
  if (filters.misPlataformas) params.set("plataformas", "mias");
  if (filters.edad) params.set("edad", filters.edad);
  if (filters.duracion) params.set("duracion", String(filters.duracion));
  if (filters.idioma) params.set("idioma", filters.idioma);
  if (filters.decada) params.set("decada", String(filters.decada));
  if (filters.votos) params.set("votos", String(filters.votos));
}

/* ── TMDB ────────────────────────────────────────────────────────────────── */

/**
 * Parámetros de `/discover` para un tipo. Con un género elegido, el preajuste
 * familiar no añade géneros (se combinaría con O y ampliaría en vez de
 * acotar): solo aplica la edad y la duración.
 */
export function toDiscoverParams(
  filters: CatalogFilters,
  mediaType: "movies" | "series",
  options: { genreId?: number; platformIds: readonly number[] },
): Record<string, string> {
  const params: Record<string, string> = { sort_by: "popularity.desc" };
  const isMovie = mediaType === "movies";
  const family = filters.familia ? FAMILY[mediaType] : null;

  if (options.genreId) params.with_genres = String(options.genreId);
  else if (family) params.with_genres = family.genres;

  const age = filters.edad || (family && isMovie ? FAMILY.movies.age : "");
  if (age && isMovie) {
    params.certification_country = "ES";
    params["certification.lte"] = age;
  }

  const duration = filters.duracion || family?.duration || 0;
  if (duration) params["with_runtime.lte"] = String(duration);

  if (filters.idioma) params.with_original_language = filters.idioma;

  if (filters.decada) {
    const from = `${filters.decada}-01-01`;
    const to = `${filters.decada + 9}-12-31`;
    if (isMovie) {
      params["primary_release_date.gte"] = from;
      params["primary_release_date.lte"] = to;
    } else {
      params["first_air_date.gte"] = from;
      params["first_air_date.lte"] = to;
    }
  }

  if (filters.votos) params["vote_count.gte"] = String(filters.votos);

  if (filters.misPlataformas && options.platformIds.length > 0) {
    params.with_watch_providers = options.platformIds.join("|");
    params.watch_region = "ES";
    params.with_watch_monetization_types = "flatrate|free|ads";
  }

  return params;
}

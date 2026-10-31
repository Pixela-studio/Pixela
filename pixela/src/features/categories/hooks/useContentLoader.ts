import { useState, useCallback, useRef } from "react";
import { Category } from "@/api/categories/categories";
import { Pelicula, Serie } from "@/features/media/types/content";
import { fetchFromAPI } from "@/api/shared/apiHelpers";
import { describeSearchError, searchAll, type SearchTitle } from "@/api/search/search";

/**
 * Respuesta estándar de la API para contenido paginado.
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  page: number;
  total_pages: number;
  total_results: number;
}

const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE: 20,
  /** TMDB no acepta más de 500 páginas. */
  MAX_TMDB_PAGES: 500,
  MIN_PAGE: 1,
} as const;

type MediaType = "all" | "movies" | "series";

/** Película o serie con su tipo, en el orden en que hay que pintarlas. */
export type OrderedItem = (Pelicula | Serie) & { mediaType: "movie" | "series" };

interface ContentState {
  movies: Pelicula[];
  series: Serie[];
  /**
   * Resultados de una búsqueda en el orden de relevancia de TMDB. `null` al
   * explorar, donde el grid ordena como siempre.
   */
  ordered: OrderedItem[] | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}

interface ContentActions {
  loadContent: (category: Category | null, page: number) => Promise<void>;
  resetContent: () => void;
  searchContent: (query: string, page?: number) => Promise<void>;
}

const buildApiEndpoint = (category: Category | null, page: number, mediaType: "movies" | "series") =>
  `${category ? `/${mediaType}/genre/${category.id}` : `/${mediaType}/discover`}?page=${page}&limit=${PAGINATION_CONFIG.ITEMS_PER_PAGE}`;

const buildSearchEndpoint = (query: string, page: number, mediaType: "movies" | "series") =>
  `/${mediaType}/search?query=${encodeURIComponent(query)}&page=${page}`;

const isValidPage = (page: number) =>
  page >= PAGINATION_CONFIG.MIN_PAGE && page <= PAGINATION_CONFIG.MAX_TMDB_PAGES;

const clampPages = (pages: number | undefined) =>
  Math.min(Math.max(pages ?? 1, 1), PAGINATION_CONFIG.MAX_TMDB_PAGES);

/**
 * Un resultado de `search/multi` con la forma cruda de TMDB que esperan las
 * tarjetas de Categorías (`title`/`name`, `release_date`/`first_air_date`).
 */
function toRawItem(item: SearchTitle): OrderedItem {
  const shared = {
    id: String(item.id),
    poster_path: item.poster_path ?? undefined,
    backdrop_path: item.backdrop_path ?? undefined,
    vote_average: item.vote_average,
    vote_count: item.vote_count,
    overview: item.overview,
  };
  return (
    item.kind === "movie"
      ? { ...shared, title: item.title, release_date: item.date, mediaType: "movie" }
      : { ...shared, name: item.title, first_air_date: item.date, mediaType: "series" }
  ) as unknown as OrderedItem;
}

/**
 * Carga y búsqueda del catálogo de Categorías.
 *
 * Cambios respecto a la versión anterior:
 * - **La petición más nueva gana.** Antes un `isLoadingRef` descartaba en
 *   silencio cualquier página o búsqueda pedida mientras otra cargaba: escribir
 *   rápido dejaba en pantalla los resultados de lo escrito a medias. Ahora cada
 *   petición lleva un número y solo la última escribe estado.
 * - **«Todo» busca con `search/multi`:** una consulta en lugar de dos (la mitad
 *   de cupo del límite por IP) y los resultados en orden de relevancia.
 * - **Total de páginas con `Math.max`.** Al explorar «Todo», el total de series
 *   pisaba al de películas y se cortaba la paginación.
 * - **Errores en castellano**, también el 429.
 */
export const useContentLoader = (
  selectedMediaType: MediaType,
): ContentState & ContentActions => {
  const [movies, setMovies] = useState<Pelicula[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [ordered, setOrdered] = useState<OrderedItem[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const requestIdRef = useRef(0);

  /** Abre una petición nueva y devuelve una función que dice si sigue vigente. */
  const beginRequest = () => {
    const id = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    return () => id === requestIdRef.current;
  };

  const resetContent = useCallback((): void => {
    requestIdRef.current++;
    setCurrentPage(1);
    setMovies([]);
    setSeries([]);
    setOrdered(null);
    setTotalPages(1);
    setError(null);
    setLoading(false);
  }, []);

  const loadContent = useCallback(
    async (category: Category | null, page: number): Promise<void> => {
      if (!isValidPage(page)) return;
      const isCurrent = beginRequest();
      setSearchQuery("");

      try {
        const wantMovies = selectedMediaType !== "series";
        const wantSeries = selectedMediaType !== "movies";
        const [movieResult, seriesResult] = await Promise.all([
          wantMovies
            ? fetchFromAPI<ApiResponse<Pelicula[]>>(buildApiEndpoint(category, page, "movies"))
            : null,
          wantSeries
            ? fetchFromAPI<ApiResponse<Serie[]>>(buildApiEndpoint(category, page, "series"))
            : null,
        ]);
        if (!isCurrent()) return;

        setMovies(movieResult?.data ?? []);
        setSeries(seriesResult?.data ?? []);
        setOrdered(null);
        setTotalPages(clampPages(Math.max(movieResult?.total_pages ?? 0, seriesResult?.total_pages ?? 0)));
        setCurrentPage(page);
      } catch (err) {
        if (isCurrent()) setError(describeSearchError(err));
      } finally {
        if (isCurrent()) setLoading(false);
      }
    },
    [selectedMediaType],
  );

  const searchContent = useCallback(
    async (query: string, page: number = 1): Promise<void> => {
      if (!query.trim() || !isValidPage(page)) return;
      const isCurrent = beginRequest();
      setSearchQuery(query);

      try {
        if (selectedMediaType === "all") {
          const result = await searchAll(query, page);
          if (!isCurrent()) return;

          const titles = result.results
            .filter((item): item is SearchTitle => item.kind !== "person")
            .map(toRawItem);
          setOrdered(titles);
          setMovies(titles.filter((item) => item.mediaType === "movie") as Pelicula[]);
          setSeries(titles.filter((item) => item.mediaType === "series") as Serie[]);
          setTotalPages(clampPages(result.totalPages));
        } else {
          const result = await fetchFromAPI<ApiResponse<(Pelicula | Serie)[]>>(
            buildSearchEndpoint(query, page, selectedMediaType),
          );
          if (!isCurrent()) return;

          const mediaType = selectedMediaType === "movies" ? "movie" : "series";
          setOrdered(result.data.map((item) => ({ ...item, mediaType }) as OrderedItem));
          setMovies(mediaType === "movie" ? (result.data as Pelicula[]) : []);
          setSeries(mediaType === "series" ? (result.data as Serie[]) : []);
          setTotalPages(clampPages(result.total_pages));
        }
        setCurrentPage(page);
      } catch (err) {
        if (isCurrent()) setError(describeSearchError(err));
      } finally {
        if (isCurrent()) setLoading(false);
      }
    },
    [selectedMediaType],
  );

  return {
    movies,
    series,
    ordered,
    loading,
    error,
    currentPage,
    totalPages,
    searchQuery,
    loadContent,
    resetContent,
    searchContent,
  };
};

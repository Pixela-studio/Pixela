import { useState, useCallback, useRef, useEffect } from "react";
import { Category } from "@/api/categories/categories";
import { Pelicula, Serie } from "@/features/media/types/content";
import { fetchFromAPI } from "@/api/shared/apiHelpers";

/**
 * Respuesta estándar de la API para contenido paginado
 * @template T - Tipo de datos contenidos en la respuesta
 * @param success - Indica si la operación fue exitosa
 * @param data - Datos de la respuesta
 * @param page - Número de página actual
 * @param total_pages - Total de páginas disponibles
 * @param total_results - Total de resultados encontrados
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  page: number;
  total_pages: number;
  total_results: number;
}

/**
 * Configuración de paginación y límites de la API
 * @param ITEMS_PER_PAGE - Número de elementos por página
 * @param MAX_TMDB_PAGES - Límite máximo de páginas de TMDB (no acepta más de 500 páginas)
 * @param MIN_PAGE - Página mínima permitida
 */
const PAGINATION_CONFIG = {
  ITEMS_PER_PAGE: 20,
  MAX_TMDB_PAGES: 500,
  MIN_PAGE: 1,
} as const;

/**
 * Tipos de media soportados por el hook
 */
type MediaType = "all" | "movies" | "series";

/**
 * Tipos de contenido que pueden ser manejados
 */
type ContentItem = Pelicula | Serie;

/**
 * Parámetros para construir endpoints de la API
 * @param category - Categoría seleccionada (opcional)
 * @param page - Número de página
 * @param mediaType - Tipo de media
 */
interface EndpointParams {
  category: Category | null;
  page: number;
  mediaType: "movies" | "series";
}

/**
 * Estado del contenido cargado
 * @param movies - Lista de películas
 * @param series - Lista de series
 * @param loading - Estado de carga
 * @param error - Mensaje de error
 * @param currentPage - Página actual
 * @param totalPages - Total de páginas disponibles
 * @param searchQuery - Término de búsqueda actual
 */
interface ContentState {
  movies: Pelicula[];
  series: Serie[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}

/**
 * Funciones disponibles para manejar el contenido
 */
interface ContentActions {
  /** Función para cargar contenido */
  loadContent: (category: Category | null, page: number) => Promise<void>;
  /** Función para resetear todo el contenido */
  resetContent: () => void;
  /** Función para buscar contenido */
  searchContent: (query: string, page?: number) => Promise<void>;
}

/**
 * Resultado completo del hook useContentLoader
 */
type UseContentLoaderResult = ContentState & ContentActions;

/**
 * Construye el endpoint de la API basado en los parámetros proporcionados
 * @param params - Parámetros para construir el endpoint
 * @returns Endpoint construido
 */
const buildApiEndpoint = ({
  category,
  page,
  mediaType,
}: EndpointParams): string => {
  const baseEndpoint = category
    ? `/${mediaType}/genre/${category.id}`
    : `/${mediaType}/discover`;

  return `${baseEndpoint}?page=${page}&limit=${PAGINATION_CONFIG.ITEMS_PER_PAGE}`;
};

/**
 * Construye el endpoint de búsqueda de la API
 * @param params - Parámetros para construir el endpoint
 * @returns Endpoint construido
 */
const buildSearchEndpoint = ({
  query,
  page,
  mediaType,
}: {
  query: string;
  page: number;
  mediaType: "movies" | "series";
}): string => {
  return `/${mediaType}/search?query=${encodeURIComponent(query)}&page=${page}`;
};

/**
 * Valida si el número de página está dentro del rango permitido
 * @param page - Número de página a validar
 * @returns true si la página es válida, false en caso contrario
 */
const isValidPage = (page: number): boolean => {
  return (
    page >= PAGINATION_CONFIG.MIN_PAGE &&
    page <= PAGINATION_CONFIG.MAX_TMDB_PAGES
  );
};

/**
 * Procesa y determina el mensaje de error apropiado basado en el error recibido
 * @param error - Error a procesar
 * @returns Mensaje de error procesado
 */
const processErrorMessage = (error: unknown): string => {
  const defaultMessage = "Error al cargar el contenido";

  if (!(error instanceof Error)) {
    return defaultMessage;
  }

  const errorMessage = error.message;

  if (errorMessage.includes("Invalid page")) {
    return `Página no válida. Las páginas deben estar entre ${PAGINATION_CONFIG.MIN_PAGE} y ${PAGINATION_CONFIG.MAX_TMDB_PAGES}.`;
  }

  if (errorMessage.includes("400")) {
    return "Error de solicitud. Verifica los parámetros.";
  }

  if (errorMessage.includes("500")) {
    return "Error del servidor. Inténtalo de nuevo más tarde.";
  }

  return errorMessage;
};

/**
 * Hook personalizado para cargar y manejar contenido de películas y series
 *
 * Este hook proporciona funcionalidad completa para:
 * - Cargar contenido por categorías o descubrimiento
 * - Manejar paginación con límites de TMDB
 * - Precargar imágenes para mejor experiencia de usuario
 * - Manejar estados de carga y errores
 * - Filtrar por tipo de media (películas, series o ambos)
 *
 * @param selectedMediaType - Tipo de media a cargar ('all' | 'movies' | 'series')
 * @returns Objeto con el estado del contenido y funciones para manejarlo
 *
 */
export const useContentLoader = (
  selectedMediaType: MediaType,
): UseContentLoaderResult => {
  // Estados del contenido
  const [movies, setMovies] = useState<Pelicula[]>([]);
  const [series, setSeries] = useState<Serie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Referencia para prevenir cargas múltiples simultáneas
  const isLoadingRef = useRef<boolean>(false);

  /**
   * Resetea todo el contenido y estado a sus valores iniciales
   */
  const resetContent = useCallback((): void => {
    setCurrentPage(1);
    setMovies([]);
    setSeries([]);
    setTotalPages(1);
    setError(null);
    isLoadingRef.current = false;
  }, []);

  /**
   * Limpia el estado de búsqueda cuando cambia el tipo de media
   */
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchQuery("");
    }
  }, [selectedMediaType]);
  /**
   * Actualiza el contenido y metadatos de paginación
   * @param newContent - Nuevo contenido a establecer
   * @param isMoviesContent - Indica si el contenido son películas (true) o series (false)
   * @param apiTotalPages - Total de páginas retornado por la API
   */
  const updateContent = useCallback(
    (
      newContent: ContentItem[],
      isMoviesContent: boolean,
      apiTotalPages: number,
    ): void => {
      // Limitar el total de páginas al máximo permitido por TMDB
      const limitedTotalPages = Math.min(
        apiTotalPages,
        PAGINATION_CONFIG.MAX_TMDB_PAGES,
      );

      if (isMoviesContent) {
        setMovies(newContent as Pelicula[]);
      } else {
        setSeries(newContent as Serie[]);
      }

      setTotalPages(limitedTotalPages);
    },
    [],
  );

  /**
   * Procesa el contenido de películas y series cuando se cargan ambos tipos
   * @param movieResult - Resultado de la API para películas
   * @param seriesResult - Resultado de la API para series
   */
  const processAllMediaContent = useCallback(
    async (
      movieResult: ApiResponse<Pelicula[]>,
      seriesResult: ApiResponse<Serie[]>,
    ): Promise<void> => {
      updateContent(movieResult.data, true, movieResult.total_pages);
      updateContent(seriesResult.data, false, seriesResult.total_pages);
    },
    [updateContent],
  );

  /**
   * Procesa el contenido cuando se cargan solo películas
   * @param movieResult - Resultado de la API para películas
   */
  const processMoviesOnly = useCallback(
    async (movieResult: ApiResponse<Pelicula[]>): Promise<void> => {
      updateContent(movieResult.data, true, movieResult.total_pages);
      setSeries([]);
    },
    [updateContent],
  );

  /**
   * Procesa el contenido cuando se cargan solo series
   * @param seriesResult - Resultado de la API para series
   */
  const processSeriesOnly = useCallback(
    async (seriesResult: ApiResponse<Serie[]>): Promise<void> => {
      updateContent(seriesResult.data, false, seriesResult.total_pages);
      setMovies([]);
    },
    [updateContent],
  );

  /**
   * Carga contenido desde la API basado en la categoría y página especificadas
   *
   * Maneja automáticamente:
   * - Validación de páginas dentro del rango permitido
   * - Prevención de cargas múltiples simultáneas
   * - Construcción de endpoints apropiados
   * - Precarga de imágenes
   * - Manejo de errores detallado
   *
   * @param category - Categoría para filtrar contenido (null para descubrimiento)
   * @param page - Número de página a cargar
   */
  const loadContent = useCallback(
    async (category: Category | null, page: number): Promise<void> => {
      // Validar rango de página
      if (!isValidPage(page)) {
        console.warn(
          `[WARNING] Página ${page} fuera del rango permitido (${PAGINATION_CONFIG.MIN_PAGE}-${PAGINATION_CONFIG.MAX_TMDB_PAGES})`,
        );
        setError(
          `Página ${page} no válida. Las páginas deben estar entre ${PAGINATION_CONFIG.MIN_PAGE} y ${PAGINATION_CONFIG.MAX_TMDB_PAGES}.`,
        );
        return;
      }

      // Prevenir cargas múltiples simultáneas
      if (isLoadingRef.current) {
        return;
      }

      // Establecer estado de carga
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const apiPromises: Promise<ApiResponse<ContentItem[]>>[] = [];

        // Construir promesas para películas si es necesario
        if (selectedMediaType === "all" || selectedMediaType === "movies") {
          const moviesEndpoint = buildApiEndpoint({
            category,
            page,
            mediaType: "movies",
          });
          apiPromises.push(
            fetchFromAPI<ApiResponse<Pelicula[]>>(moviesEndpoint),
          );
        }

        // Construir promesas para series si es necesario
        if (selectedMediaType === "all" || selectedMediaType === "series") {
          const seriesEndpoint = buildApiEndpoint({
            category,
            page,
            mediaType: "series",
          });
          apiPromises.push(fetchFromAPI<ApiResponse<Serie[]>>(seriesEndpoint));
        }

        const apiResults = await Promise.all(apiPromises);

        // Procesar resultados según el tipo de media seleccionado
        switch (selectedMediaType) {
          case "all": {
            const [movieResult, seriesResult] = apiResults as [
              ApiResponse<Pelicula[]>,
              ApiResponse<Serie[]>,
            ];

            if (!movieResult.success || !seriesResult.success) {
              throw new Error("Error al obtener datos de películas o series");
            }

            await processAllMediaContent(movieResult, seriesResult);
            break;
          }

          case "movies": {
            const movieResult = apiResults[0] as ApiResponse<Pelicula[]>;

            if (!movieResult.success) {
              throw new Error("Error al obtener datos de películas");
            }

            await processMoviesOnly(movieResult);
            break;
          }

          case "series": {
            const seriesResult = apiResults[0] as ApiResponse<Serie[]>;

            if (!seriesResult.success) {
              throw new Error("Error al obtener datos de series");
            }

            await processSeriesOnly(seriesResult);
            break;
          }
        }

        setCurrentPage(page);
      } catch (error) {
        console.error("Error al cargar el contenido:", error);
        const errorMessage = processErrorMessage(error);
        setError(errorMessage);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [
      selectedMediaType,
      processAllMediaContent,
      processMoviesOnly,
      processSeriesOnly,
    ],
  );

  /**
   * Realiza una búsqueda en el contenido
   * @param query - Término de búsqueda
   * @param page - Número de página
   */
  const searchContent = useCallback(
    async (query: string, page: number = 1): Promise<void> => {
      if (!query.trim() || !isValidPage(page)) {
        return;
      }

      if (isLoadingRef.current) {
        return;
      }

      setLoading(true);
      setError(null);
      setSearchQuery(query);
      isLoadingRef.current = true;

      try {
        if (selectedMediaType === "all") {
          const [movieResult, seriesResult] = await Promise.all([
            fetchFromAPI<ApiResponse<Pelicula[]>>(
              buildSearchEndpoint({ query, page, mediaType: "movies" }),
            ),
            fetchFromAPI<ApiResponse<Serie[]>>(
              buildSearchEndpoint({ query, page, mediaType: "series" }),
            ),
          ]);

          if (!movieResult.success || !seriesResult.success) {
            throw new Error("Error al obtener resultados de búsqueda");
          }

          await processAllMediaContent(movieResult, seriesResult);
        } else {
          const endpoint = buildSearchEndpoint({
            query,
            page,
            mediaType: selectedMediaType as "movies" | "series",
          });

          const result =
            await fetchFromAPI<ApiResponse<ContentItem[]>>(endpoint);
          const isMoviesContent = selectedMediaType === "movies";

          if (!result.success) {
            throw new Error("Error al obtener resultados de búsqueda");
          }

          updateContent(result.data, isMoviesContent, result.total_pages);
        }

        setCurrentPage(page);
      } catch (error) {
        setError(processErrorMessage(error));
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [selectedMediaType, processAllMediaContent, updateContent],
  );

  return {
    movies,
    series,
    loading,
    error,
    currentPage,
    totalPages: Math.min(totalPages, PAGINATION_CONFIG.MAX_TMDB_PAGES),
    searchQuery,

    loadContent,
    resetContent,
    searchContent,
  };
};

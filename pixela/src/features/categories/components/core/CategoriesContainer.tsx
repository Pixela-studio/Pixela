"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CategoriesList } from "@/features/categories/components/navigation/CategoriesList";
import { CategoriesContent } from "@/features/categories/components/core/CategoriesContent";
import { CategoriesHeader } from "@/features/categories/components/navigation/CategoriesHeader";
import { Pagination } from "@/features/categories/components/ui/Pagination";
import { Category } from "@/api/categories/categories";
import { useCategoriesStore } from "@/features/categories/store/categoriesStore";
import { useContentLoader } from "@/features/categories/hooks/useContentLoader";
import { MediaType } from "@/features/categories/types/media";
import { FiltersPanel } from "@/features/categories/components/filters/FiltersPanel";
import {
  readFilters,
  writeFilters,
  type CatalogFilters,
} from "@/features/categories/filters";
import { useMyPlatforms } from "@/hooks/useMyPlatforms";

const STYLES = {
  // Layout Principal
  container:
    "min-h-screen bg-gradient-to-br from-pixela-dark via-pixela-dark to-pixela-dark pt-24",
  contentWrapper: "container mx-auto px-4 py-8 md:py-12",
  mainContent: "flex flex-col lg:flex-row gap-6 md:gap-8 items-start",

  // Barra Lateral de Categorías
  categoriesContainer:
    "w-full lg:w-64 flex-shrink-0 lg:sticky lg:top-28 max-w-md mx-auto lg:mx-0 lg:max-w-none hidden lg:block",

  // Área de Contenido
  contentArea: "flex-1 w-full max-w-4xl mx-auto lg:mx-0 lg:max-w-none",

  // Búsqueda y Paginación
  searchContainer: "w-full max-w-4xl mx-auto mb-6 lg:max-w-none",
  paginationContainer: "w-full max-w-4xl mx-auto my-8 md:my-12 lg:max-w-none",
} as const;

/**
 * Componente principal que maneja la visualización y navegación de categorías de contenido.
 * Permite filtrar por tipo de medio (películas/series) y categorías específicas.
 * Implementa paginación para la navegación del contenido.
 *
 * @component
 * @returns {JSX.Element} El componente CategoriesContainer renderizado
 */
const MEDIA_TYPES: readonly MediaType[] = ["all", "movies", "series", "random"];

/** Estado de Categorías tal como vive en la URL. */
interface UrlState {
  tipo: MediaType;
  genero: number | null;
  q: string;
  pagina: number;
  filtros: CatalogFilters;
}

function readUrlState(params: URLSearchParams): UrlState {
  const tipo = params.get("tipo") as MediaType | null;
  const genero = Number.parseInt(params.get("genero") ?? "", 10);
  const pagina = Number.parseInt(params.get("pagina") ?? "", 10);
  return {
    tipo: tipo && MEDIA_TYPES.includes(tipo) ? tipo : "all",
    genero: Number.isInteger(genero) && genero > 0 ? genero : null,
    q: (params.get("q") ?? "").trim().slice(0, 200),
    pagina: Number.isInteger(pagina) && pagina > 0 ? Math.min(pagina, 500) : 1,
    filtros: readFilters(params),
  };
}

function toQueryString({ tipo, genero, q, pagina, filtros }: UrlState): string {
  const params = new URLSearchParams();
  if (tipo !== "all") params.set("tipo", tipo);
  if (genero) params.set("genero", String(genero));
  if (q) params.set("q", q);
  if (pagina > 1) params.set("pagina", String(pagina));
  writeFilters(params, filtros);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/**
 * Categorías: explorar por tipo y género, buscar y paginar.
 *
 * El tipo, el género, la búsqueda y la página viven en la URL
 * (`/categories?tipo=movies&genero=27&q=…&pagina=2`). Antes eran estado en
 * memoria: al entrar en una ficha y volver atrás se perdía la búsqueda, y no se
 * podía mandar a nadie un enlace a «terror, página 3». Se usa `replace` para no
 * llenar el historial con cada pulsación del buscador.
 */
export const CategoriesContainer = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialUrlState] = useState(() =>
    readUrlState(new URLSearchParams(searchParams.toString())),
  );

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    initialUrlState.genero ? ({ id: initialUrlState.genero, name: "" } as Category) : null,
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const [restored, setRestored] = useState(false);
  const [filters, setFilters] = useState<CatalogFilters>(initialUrlState.filtros);
  const { ids: platformIds } = useMyPlatforms();
  const discover = { filters, platformIds };
  const { selectedMediaType, setSelectedMediaType, categories } = useCategoriesStore();

  // Para el hook useContentLoader, convertimos 'random' a 'all' ya que cargamos todo
  const loaderMediaType =
    selectedMediaType === "random" ? "all" : selectedMediaType;

  const {
    movies,
    series,
    ordered,
    loading,
    error,
    currentPage,
    totalPages,
    loadContent,
    resetContent,
    searchContent,
    searchQuery,
  } = useContentLoader(loaderMediaType);

  // El género restaurado desde la URL llega solo con el id; el nombre se
  // completa cuando la lista de géneros está en memoria.
  const resolvedCategory =
    selectedCategory && !selectedCategory.name
      ? categories.find((category) => category.id === selectedCategory.id) ?? selectedCategory
      : selectedCategory;

  const syncUrl = useCallback(
    (state: UrlState) => {
      router.replace(`${pathname}${toQueryString(state)}`, { scroll: false });
    },
    [router, pathname],
  );

  const handleCategorySelect = useCallback(
    async (category: Category) => {
      setSelectedCategory(category);
      resetContent();
      syncUrl({ tipo: selectedMediaType, genero: category.id, q: "", pagina: 1, filtros: filters });
      await loadContent(category, 1, discover);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loadContent, resetContent, syncUrl, selectedMediaType, filters, platformIds],
  );

  /** Cambio de página; conserva la búsqueda si la hay. */
  const handlePageChange = useCallback(
    async (page: number) => {
      const q = searchQuery.trim();
      syncUrl({
        tipo: selectedMediaType,
        genero: q ? null : selectedCategory?.id ?? null,
        q,
        pagina: page,
        filtros: filters,
      });
      if (q) {
        await searchContent(q, page);
      } else {
        await loadContent(selectedCategory, page, discover);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCategory, loadContent, searchContent, searchQuery, syncUrl, selectedMediaType, filters, platformIds],
  );

  const handleMediaTypeChange = useCallback(
    (type: MediaType) => {
      setSelectedMediaType(type);
      setSelectedCategory(null);
      resetContent();
      syncUrl({ tipo: type, genero: null, q: "", pagina: 1, filtros: filters });
    },
    [setSelectedMediaType, resetContent, syncUrl, filters],
  );

  const handleSearch = useCallback(
    async (query: string) => {
      const q = query.trim();
      setSelectedCategory(null);
      resetContent();
      syncUrl({ tipo: selectedMediaType, genero: null, q, pagina: 1, filtros: filters });
      if (q) {
        await searchContent(q, 1);
      } else {
        await loadContent(null, 1, discover);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchContent, loadContent, resetContent, syncUrl, selectedMediaType, filters, platformIds],
  );

  // Arranque: el tipo sale de la URL.
  useEffect(() => {
    if (isInitialized) return;
    setSelectedMediaType(initialUrlState.tipo);
    setIsInitialized(true);
  }, [isInitialized, initialUrlState, setSelectedMediaType]);

  // Carga al cambiar de tipo. La primera vez restaura género, búsqueda y
  // página de la URL; las siguientes empieza de cero.
  useEffect(() => {
    if (!isInitialized) return;
    if (!restored) {
      setRestored(true);
      const { q, pagina } = initialUrlState;
      if (q) void searchContent(q, pagina);
      else void loadContent(selectedCategory, pagina, discover);
      return;
    }
    void loadContent(null, 1, discover);
    // `selectedCategory` y `restored` solo cuentan en el arranque.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMediaType, isInitialized, loadContent, searchContent]);

  // Scroll automático al top cuando cambia la página (excepto la inicial)
  useEffect(() => {
    if (currentPage > 1 && typeof window !== "undefined") {
      const timeoutId = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [currentPage]);

  /** Reintenta lo último que se pidió: la búsqueda o la página del género. */
  const handleRetry = useCallback(() => {
    if (searchQuery.trim()) void searchContent(searchQuery, currentPage);
    else void loadContent(selectedCategory, currentPage, discover);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, searchContent, loadContent, selectedCategory, currentPage, filters, platformIds]);

  /** Cambiar un filtro vuelve a la página 1 del mismo género. */
  const handleFiltersChange = useCallback(
    (next: CatalogFilters) => {
      setFilters(next);
      syncUrl({
        tipo: selectedMediaType,
        genero: selectedCategory?.id ?? null,
        q: searchQuery.trim(),
        pagina: 1,
        filtros: next,
      });
      if (!searchQuery.trim()) void loadContent(selectedCategory, 1, { filters: next, platformIds });
    },
    [syncUrl, selectedMediaType, selectedCategory, searchQuery, loadContent, platformIds],
  );

  // Si cambian las plataformas elegidas con el filtro puesto, se recarga.
  const platformKey = platformIds.join(",");
  const [lastPlatformKey, setLastPlatformKey] = useState(platformKey);
  useEffect(() => {
    if (platformKey === lastPlatformKey) return;
    setLastPlatformKey(platformKey);
    if (filters.misPlataformas && !searchQuery.trim() && restored) {
      void loadContent(selectedCategory, 1, { filters, platformIds });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformKey]);

  return (
    <div className={STYLES.container}>
      <div className={STYLES.contentWrapper}>
        <CategoriesHeader
          selectedMediaType={selectedMediaType}
          onMediaTypeChange={handleMediaTypeChange}
        />

        <div className={STYLES.mainContent}>
          {isInitialized &&
            selectedMediaType !== "all" &&
            selectedMediaType !== "random" && (
              <div className={STYLES.categoriesContainer}>
                <CategoriesList
                  onCategorySelect={handleCategorySelect}
                  selectedCategory={resolvedCategory}
                  mediaType={selectedMediaType}
                />
              </div>
            )}

          <div className={STYLES.contentArea}>
            {/* Botón de categorías para móvil y tablet */}
            {isInitialized &&
              selectedMediaType !== "all" &&
              selectedMediaType !== "random" && (
                <div className="mb-6 lg:hidden">
                  <CategoriesList
                    onCategorySelect={handleCategorySelect}
                    selectedCategory={resolvedCategory}
                    mediaType={selectedMediaType}
                  />
                </div>
              )}

            <FiltersPanel
              filters={filters}
              onChange={handleFiltersChange}
              mediaType={selectedMediaType}
              searching={Boolean(searchQuery.trim())}
            />

            {filters.misPlataformas && platformIds.length === 0 && (
              <p className="mb-6 text-sm text-gray-400">
                Elige tus plataformas en «Filtros» para ver solo lo que tienes incluido.
              </p>
            )}

            <div className="transform-gpu">
              <CategoriesContent
                selectedCategory={resolvedCategory}
                ordered={ordered}
                onRetry={handleRetry}
                movies={
                  selectedMediaType === "random"
                    ? movies
                    : selectedMediaType === "series"
                      ? []
                      : movies
                }
                series={
                  selectedMediaType === "random"
                    ? series
                    : selectedMediaType === "movies"
                      ? []
                      : series
                }
                loading={loading}
                error={error}
                searchQuery={searchQuery}
                onSearch={handleSearch}
                mediaType={selectedMediaType}
                currentPage={currentPage}
                totalPages={totalPages}
              />
            </div>

            {totalPages > 1 && selectedMediaType !== "random" && (
              <div className={STYLES.paginationContainer}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  disabled={loading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

"use client";

import { useState, useEffect, useCallback } from "react";
import { CategoriesList } from "@/features/categories/components/navigation/CategoriesList";
import { CategoriesContent } from "@/features/categories/components/core/CategoriesContent";
import { CategoriesHeader } from "@/features/categories/components/navigation/CategoriesHeader";
import { Pagination } from "@/features/categories/components/ui/Pagination";
import { Category } from "@/api/categories/categories";
import { useCategoriesStore } from "@/features/categories/store/categoriesStore";
import { useContentLoader } from "@/features/categories/hooks/useContentLoader";
import { MediaType } from "@/features/categories/types/media";

const STYLES = {
  // Layout Principal
  container:
    "min-h-screen bg-gradient-to-br from-pixela-dark via-[#1a1a1a] to-pixela-dark pt-24",
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
export const CategoriesContainer = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const { selectedMediaType, setSelectedMediaType } = useCategoriesStore();

  // Para el hook useContentLoader, convertimos 'random' a 'all' ya que cargamos todo
  const loaderMediaType =
    selectedMediaType === "random" ? "all" : selectedMediaType;

  const {
    movies,
    series,
    loading,
    error,
    currentPage,
    totalPages,
    loadContent,
    resetContent,
    searchContent,
    searchQuery,
  } = useContentLoader(loaderMediaType);

  /**
   * Maneja la selección de una categoría y carga su contenido.
   *
   * @param {Category} category - La categoría seleccionada
   */
  const handleCategorySelect = useCallback(
    async (category: Category) => {
      setSelectedCategory(category);
      resetContent();
      await loadContent(category, 1);
    },
    [loadContent, resetContent],
  );

  /**
   * Maneja el cambio de página en la paginación.
   * Preserva el término de búsqueda si existe una búsqueda activa.
   *
   * @param {number} page - El número de página a cargar
   */
  const handlePageChange = useCallback(
    async (page: number) => {
      if (searchQuery.trim()) {
        // Si hay una búsqueda activa, usar searchContent para preservar el término de búsqueda
        await searchContent(searchQuery, page);
      } else {
        // Si no hay búsqueda, usar loadContent normal
        await loadContent(selectedCategory, page);
      }
    },
    [selectedCategory, loadContent, searchContent, searchQuery],
  );

  /**
   * Maneja el cambio de tipo de medio.
   *
   * @param {MediaType} type - El nuevo tipo de medio
   */
  const handleMediaTypeChange = useCallback(
    async (type: MediaType) => {
      setSelectedMediaType(type);
      setSelectedCategory(null);
      resetContent();
    },
    [setSelectedMediaType, resetContent],
  );

  /**
   * Maneja la búsqueda de contenido
   * @param {string} query - Término de búsqueda
   */
  const handleSearch = useCallback(
    async (query: string) => {
      if (query.trim()) {
        setSelectedCategory(null);
        resetContent();
        await searchContent(query, 1);
      } else {
        resetContent();
        await loadContent(null, 1);
      }
    },
    [searchContent, loadContent, resetContent],
  );

  // Carga inicial del contenido
  useEffect(() => {
    const initializeContent = async () => {
      if (!isInitialized) {
        await handleMediaTypeChange("all");
        setIsInitialized(true);
      }
    };

    initializeContent();
  }, [isInitialized, handleMediaTypeChange]);

  // Manejar cambios en el tipo de medio después de la inicialización
  useEffect(() => {
    if (isInitialized) {
      loadContent(null, 1);
    }
  }, [selectedMediaType, isInitialized, loadContent]);

  // Scroll automático al top cuando cambia la página (excepto la inicial)
  useEffect(() => {
    if (currentPage > 1 && typeof window !== "undefined") {
      // Pequeño delay para asegurar que el contenido se ha actualizado
      const timeoutId = setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [currentPage]);

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
                  selectedCategory={selectedCategory}
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
                    selectedCategory={selectedCategory}
                    mediaType={selectedMediaType}
                  />
                </div>
              )}

            <div className="transform-gpu">
              <CategoriesContent
                selectedCategory={selectedCategory}
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

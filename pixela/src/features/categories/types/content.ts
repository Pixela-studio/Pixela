import { Category } from "@/api/categories/categories";
import { Pelicula, Serie } from "@/features/media/types/content";

/**
 * Props del componente CategoriesContent
 * @interface
 * @param {Category | null} selectedCategory - Categoría seleccionada
 * @param {Pelicula[]} movies - Array de películas
 * @param {Serie[]} series - Array de series
 * @param {boolean} loading - Indica si se está cargando el contenido
 * @param {string | null} error - Mensaje de error si hay algún problema
 * @param {string} searchQuery - Término de búsqueda actual
 * @param {(query: string) => void} onSearch - Función para manejar búsquedas
 * @param {'all' | 'movies' | 'series' | 'random'} mediaType - Tipo de media actual
 * @param {number} currentPage - Página actual
 * @param {number} totalPages - Total de páginas disponibles
 */
export interface CategoriesContentProps {
  selectedCategory: Category | null;
  movies: Pelicula[];
  series: Serie[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  onSearch: (query: string) => void;
  mediaType: "all" | "movies" | "series" | "random";
  currentPage: number;
  totalPages: number;
}

/**
 * Props del componente ContentSkeleton
 * @interface
 * @param {number} [count=12] - Número de elementos esqueleto a mostrar
 */
export interface ContentSkeletonProps {
  count?: number;
}

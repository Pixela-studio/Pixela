/**
 * Props para consumidores del feature de categorías.
 */
export interface CategoriesProps {
    onCategorySelect?: (category: import('@/api/categories/categories').Category) => void;
    selectedCategory?: import('@/api/categories/categories').Category | null;
    mediaType?: 'all' | 'movies' | 'series';
}

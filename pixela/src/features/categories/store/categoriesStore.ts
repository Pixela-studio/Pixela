import { create } from 'zustand';
import { getCategoriesForMediaType } from '@/api/categories/categories';
import { Category } from '@/api/categories/categories';
import { MediaType } from '../types/media';

/**
 * Estado de las categorías. Interno al store: no lo consume nadie fuera.
 */
interface CategoriesState {
    categories: Category[];
    loading: boolean;
    error: string | null;
    selectedMediaType: MediaType;
    selectedCategory: string | null;
    fetchCategories: (mediaType?: MediaType) => Promise<void>;
    setSelectedMediaType: (type: MediaType) => void;
    setSelectedCategory: (category: string | null) => void;
}

/**
 * Hook para el estado de las categorías
 * @function useCategoriesStore - Hook para el estado de las categorías
 * @returns {CategoriesState} - El estado de las categorías
 * @returns {function} fetchCategories - Función para cargar las categorías
 * @returns {function} setSelectedMediaType - Función para establecer el tipo de medio seleccionado
 * @returns {function} setSelectedCategory - Función para establecer la categoría seleccionada
 */
export const useCategoriesStore = create<CategoriesState>((set, get) => ({
    categories: [],
    loading: false,
    error: null,
    selectedMediaType: 'all' as MediaType,
    selectedCategory: null,

    fetchCategories: async (mediaType?: MediaType) => {
        set({ loading: true, error: null });
        try {
            const currentMediaType = mediaType || get().selectedMediaType;
            // Para 'random', usamos 'all' para obtener todas las categorías
            const apiMediaType = currentMediaType === 'random' ? 'all' : currentMediaType;
            const categories = await getCategoriesForMediaType(apiMediaType);
            set({ categories, loading: false });
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : 'Error al cargar las categorías',
                loading: false 
            });
        }
    },

    /**
     * Función para establecer el tipo de medio seleccionado
     * @param {MediaType} type - El tipo de medio seleccionado
     * @returns {void} - No devuelve nada
     */
    setSelectedMediaType: (type: MediaType) => {
        set({ selectedMediaType: type });
        get().fetchCategories(type);
    },

    /**
     * Función para establecer la categoría seleccionada
     * @param {string | null} category - La categoría seleccionada
     * @returns {void} - No devuelve nada
     */
    setSelectedCategory: (category: string | null) => set({ selectedCategory: category }),
})); 
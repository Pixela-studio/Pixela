import { create } from 'zustand';
import { getAllCategories, filterCategoriesForMediaType } from '@/api/categories/categories';
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
 * Caché de la lista completa de géneros para toda la sesión.
 *
 * `/api/tmdb/categories` se pedía tres veces cada vez que se cambiaba de tipo de
 * medio: una desde `setSelectedMediaType` y otra por cada `CategoriesList`
 * montado (hay dos, la barra lateral de escritorio y el desplegable móvil, y
 * ambos llaman a `fetchCategories` en su efecto de montaje).
 *
 * Las tres pedían además **lo mismo**: la API devuelve siempre el catálogo
 * completo de géneros de TMDB y el filtrado por tipo de medio es local. Con una
 * sola petición por sesión sobra: los géneros de TMDB no cambian.
 */
let cachedCategories: Category[] | null = null;

/** Petición en vuelo, para que dos montajes simultáneos compartan la misma. */
let inFlight: Promise<Category[]> | null = null;

function loadAllCategories(): Promise<Category[]> {
    if (cachedCategories) return Promise.resolve(cachedCategories);

    if (!inFlight) {
        inFlight = getAllCategories()
            .then((categories) => {
                cachedCategories = categories;
                return categories;
            })
            .finally(() => {
                inFlight = null;
            });
    }

    return inFlight;
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
        const currentMediaType = mediaType || get().selectedMediaType;
        // Para 'random', usamos 'all' para obtener todas las categorías
        const apiMediaType = currentMediaType === 'random' ? 'all' : currentMediaType;

        // Con el catálogo ya en memoria no hay ni petición ni parpadeo de carga:
        // el filtrado es síncrono.
        if (cachedCategories) {
            set({
                categories: filterCategoriesForMediaType(cachedCategories, apiMediaType),
                loading: false,
                error: null,
            });
            return;
        }

        set({ loading: true, error: null });

        try {
            const all = await loadAllCategories();
            set({
                categories: filterCategoriesForMediaType(all, apiMediaType),
                loading: false,
            });
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

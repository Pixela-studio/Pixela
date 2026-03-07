import { FiChevronLeft, FiChevronRight, FiLoader } from 'react-icons/fi';
import { PaginationProps } from '@/features/categories/types/pagination';

const STYLES = {
    // Contenedor principal
    container: 'flex justify-center items-center gap-2 md:gap-3 transition-all duration-300 flex-wrap',

    // Botones de página
    button: 'flex items-center justify-center rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium',
    pageButton: 'w-10 h-10 md:w-12 md:h-12 text-base md:text-lg relative',
    activeButton: 'bg-pixela-accent text-white shadow-xl shadow-pixela-accent/20 scale-105',
    inactiveButton: 'bg-pixela-dark/30 text-pixela-light/80 border border-pixela-accent/20 hover:bg-pixela-accent/10 hover:border-pixela-accent/40 hover:scale-105',

    // Estados de loading
    loadingButton: 'bg-pixela-accent/50 text-white shadow-xl shadow-pixela-accent/10 cursor-wait',
    loadingOverlay: 'absolute inset-0 flex items-center justify-center bg-pixela-accent/90 rounded-xl',
    loadingSpinner: 'w-4 h-4 md:w-5 md:h-5 animate-spin',

    // Elementos de navegación
    ellipsis: 'flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-pixela-light/60 text-base md:text-lg tracking-widest',
    navButton: 'w-10 h-10 md:w-12 md:h-12 text-pixela-light/60 hover:text-pixela-accent hover:scale-110 transition-all duration-200',
    chevronIcon: 'w-6 h-6 transition-transform duration-200',
    
    // Disabled state improvements
    disabledContainer: 'opacity-60 pointer-events-none'
} as const;

const MAX_TOTAL_PAGES = 500; // Límite de TMDB

/**
 * Componente de paginación que muestra controles de navegación entre páginas.
 * Incluye botones de navegación, números de página y manejo de estados.
 * 
 * @component
 * @param {PaginationProps} props - Propiedades del componente
 * @returns {JSX.Element | null} Los controles de paginación o null si no hay páginas
 */
export const Pagination = ({ currentPage, totalPages, onPageChange, disabled = false }: PaginationProps) => {
    // Limitar totalPages al máximo permitido
    const limitedTotalPages = Math.min(totalPages, MAX_TOTAL_PAGES);
    
    const getPageNumbers = () => {
        const pages: (number | '...')[] = [];
        const maxVisiblePages = typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 5;
        
        if (limitedTotalPages <= maxVisiblePages) {
            return Array.from({ length: limitedTotalPages }, (_, i) => i + 1);
        }

        // Siempre mostrar las páginas 1, 2, 3
        pages.push(1);
        if (limitedTotalPages > 1) pages.push(2);
        if (limitedTotalPages > 2) pages.push(3);

        // Mostrar la página siguiente a la actual (4, 5, 6, etc.)
        const nextPage = Math.max(4, currentPage + 1);
        if (currentPage >= 3 && nextPage <= limitedTotalPages && nextPage > 3) {
            // Solo agregar puntos suspensivos si hay gap
            if (nextPage > 4) {
                pages.push('...');
            }
            pages.push(nextPage);
        }

        // Si la página actual está más allá de la siguiente y no es la última
        if (currentPage > nextPage && currentPage < limitedTotalPages) {
            if (currentPage > nextPage + 1) {
                pages.push('...');
            }
            pages.push(currentPage);
        }

        // Agregar puntos suspensivos y última página si es necesario
        if (limitedTotalPages > Math.max(nextPage, currentPage)) {
            const lastDisplayed = Math.max(nextPage, currentPage, 3);
            if (lastDisplayed < limitedTotalPages - 1) {
                pages.push('...');
            }
            if (limitedTotalPages > 3) {
                pages.push(limitedTotalPages);
            }
        }

        return pages;
    };

    if (limitedTotalPages <= 1 || currentPage > MAX_TOTAL_PAGES) return null;

    return (
        <div className={`${STYLES.container} ${disabled ? STYLES.disabledContainer : ''}`}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || disabled}
                className={`${STYLES.button} ${STYLES.navButton} group`}
                aria-label="Página anterior"
            >
                <FiChevronLeft className={`${STYLES.chevronIcon} ${currentPage === 1 ? '' : 'group-hover:-translate-x-0.5'}`} />
            </button>

            {getPageNumbers().map((page, index) => (
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className={STYLES.ellipsis}>
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page as number)}
                        disabled={disabled || (page as number) > MAX_TOTAL_PAGES}
                        className={`${STYLES.button} ${STYLES.pageButton} ${
                            currentPage === page
                                ? disabled 
                                    ? STYLES.loadingButton
                                    : STYLES.activeButton
                                : STYLES.inactiveButton
                        } group`}
                        aria-label={`Ir a página ${page}`}
                    >
                        {currentPage === page && disabled ? (
                            <div className={STYLES.loadingOverlay}>
                                <FiLoader className={STYLES.loadingSpinner} />
                            </div>
                        ) : null}
                        <span className={currentPage === page && disabled ? 'opacity-0' : 'opacity-100'}>
                            {page}
                        </span>
                    </button>
                )
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === limitedTotalPages || disabled}
                className={`${STYLES.button} ${STYLES.navButton} group`}
                aria-label="Página siguiente"
            >
                <FiChevronRight className={`${STYLES.chevronIcon} ${currentPage === limitedTotalPages ? '' : 'group-hover:translate-x-0.5'}`} />
            </button>
        </div>
    );
};
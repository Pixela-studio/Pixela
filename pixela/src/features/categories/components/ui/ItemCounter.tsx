'use client';

import { memo } from 'react';
import { FiGrid, FiSearch } from 'react-icons/fi';
import { ItemCounterProps } from '@/features/categories/types/components';

const STYLES = {
    container: 'flex items-center justify-between mb-6',
    leftSection: 'flex items-center gap-3',
    rightSection: 'flex items-center gap-4 text-sm',
    icon: 'w-5 h-5 text-pixela-accent',
    mainText: 'text-pixela-light/60 font-medium',
    secondaryText: 'text-pixela-light/60 text-sm',
    searchBadge: 'px-2 py-1 bg-pixela-accent text-white rounded text-xs font-medium shadow-lg shadow-pixela-accent/20',
    pageInfo: 'text-pixela-light/60',
} as const;

/**
 * Componente que muestra información sobre los elementos cargados
 * en la página actual, incluyendo contadores y información de paginación.
 * 
 * @component
 * @param {ItemCounterProps} props - Propiedades del componente
 * @returns {JSX.Element} El contador de elementos renderizado
 */
export const ItemCounter = memo(({
    moviesCount,
    seriesCount,
    currentPage,
    totalPages,
    isSearching,
    searchQuery,
    mediaType
}: ItemCounterProps) => {
    const totalItems = moviesCount + seriesCount;

    // No mostrar el contador si no hay elementos
    if (totalItems === 0) {
        return null;
    }

    /**
     * Genera el texto principal del contador basado en el tipo de media
     */
    const getMainText = () => {
        if (mediaType === 'movies') {
            return `${moviesCount} ${moviesCount === 1 ? 'película' : 'películas'}`;
        }
        
        if (mediaType === 'series') {
            return `${seriesCount} ${seriesCount === 1 ? 'serie' : 'series'}`;
        }
        
        // Para 'all' o 'random'
        const parts: string[] = [];
        if (moviesCount > 0) {
            parts.push(`${moviesCount} ${moviesCount === 1 ? 'película' : 'películas'}`);
        }
        if (seriesCount > 0) {
            parts.push(`${seriesCount} ${seriesCount === 1 ? 'serie' : 'series'}`);
        }
        
        if (parts.length === 2) {
            return parts.join(' • ');
        }
        
        return parts[0] || `${totalItems} elementos`;
    };

    /**
     * Genera el texto secundario con información adicional
     */
    const getSecondaryText = () => {
        if (isSearching && searchQuery) {
            return `encontrados`;
        }
        
        if (totalPages > 1) {
            return `en esta página`;
        }
        
        return 'cargados';
    };

    return (
        <div className={STYLES.container}>
            <div className={STYLES.leftSection}>
                {isSearching && searchQuery ? (
                    <FiSearch className={STYLES.icon} />
                ) : (
                    <FiGrid className={STYLES.icon} />
                )}
                
                <div>
                    <div className={STYLES.mainText}>
                        {getMainText()} {getSecondaryText()}
                    </div>
                    
                    {isSearching && searchQuery && (
                        <div className={STYLES.secondaryText}>
                            para &ldquo;{searchQuery}&rdquo;
                        </div>
                    )}
                </div>
            </div>

            <div className={STYLES.rightSection}>
                {isSearching && searchQuery && (
                    <div className={STYLES.searchBadge}>
                        Búsqueda activa
                    </div>
                )}
                
                {totalPages > 1 && (
                    <div className={STYLES.pageInfo}>
                        Página {currentPage} de {totalPages}
                    </div>
                )}
            </div>
        </div>
    );
});

ItemCounter.displayName = 'ItemCounter'; 
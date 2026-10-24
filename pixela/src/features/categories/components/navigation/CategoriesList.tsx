'use client';

import { useState, useEffect } from 'react';
import { CategoriesProps } from '@/features/categories/types/categories';
import { useCategoriesStore } from '@/features/categories/store/categoriesStore';
import { FiGrid, FiChevronDown } from 'react-icons/fi';
import { CategoriesModal } from '@/features/categories/components/ui/CategoriesModal';
import { Category } from '@/api/categories/categories';

const STYLES = {
    // Contenedores principales
    container: 'w-full',
    categoriesWrapper: 'w-full',
    categoriesContainer: 'p-3 md:p-0 md:pt-0 md:pb-12',
    desktopContainer: 'hidden lg:block',

    // Título
    title: 'text-lg md:text-xl font-semibold mb-3 md:mb-4 text-white',

    // Lista de categorías
    list: 'space-y-1.5 md:space-y-6',

    // Botones de categoría
    categoryButton: 'w-full px-3 md:px-4 py-2 md:py-3 rounded-lg transition duration-200 font-medium text-sm flex items-center gap-2 md:gap-3 mb-2 md:mb-4',
    categoryButtonActive: 'bg-pixela-accent/10 text-pixela-accent border border-pixela-accent/30',
    categoryButtonInactive: 'bg-pixela-dark/20 text-pixela-light/60 border border-pixela-accent/10 hover:bg-pixela-accent/5 hover:text-pixela-accent/80',
    categoryIcon: 'w-4 h-4 text-pixela-light/60',
    categoryName: 'truncate',

    // Botón móvil
    mobileButton: 'lg:hidden w-full px-4 py-3 rounded-xl bg-pixela-dark/30 text-pixela-light/80 border border-pixela-accent/20 flex items-center justify-between hover:bg-pixela-accent/10 hover:border-pixela-accent/40',
    mobileButtonContent: 'flex items-center gap-2',
    chevronIcon: 'w-5 h-5',

    // Estados de carga y error
    loadingContainer: 'flex justify-center items-center p-4',
    loadingSpinner: 'animate-spin rounded-full h-6 w-6 border-2 border-pixela-accent border-t-transparent',
    errorContainer: 'text-center p-4 bg-red-500/10 backdrop-blur-sm rounded-xl border border-red-500/20',
    errorText: 'text-red-400 font-medium'
} as const;

/**
 * Componente que muestra la lista de categorías.
 * 
 * @component
 * @param {CategoriesProps} props - Propiedades del componente
 * @returns {JSX.Element} La lista de categorías renderizada
 */
export const CategoriesList: React.FC<CategoriesProps> = ({ 
    onCategorySelect,
    selectedCategory 
}) => {
    const { categories, loading, error, fetchCategories } = useCategoriesStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    if (loading) {
        return (
            <div className={STYLES.loadingContainer}>
                <div className={STYLES.loadingSpinner}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={STYLES.errorContainer}>
                <p className={STYLES.errorText}>{error}</p>
            </div>
        );
    }

    const handleCategorySelect = (category: Category) => {
        if (onCategorySelect) {
            onCategorySelect(category);
        }
    };

    return (
        <div className={STYLES.container}>
            {/* Botón para móvil */}
            <button 
                className={STYLES.mobileButton}
                onClick={() => setIsModalOpen(true)}
            >
                <span className={STYLES.mobileButtonContent}>
                    <FiGrid className={STYLES.categoryIcon} />
                    <span>{selectedCategory?.name || 'Seleccionar categoría'}</span>
                </span>
                <FiChevronDown className={STYLES.chevronIcon} />
            </button>

            {/* Lista para desktop */}
            <div className={STYLES.desktopContainer}>
                <div className={STYLES.categoriesWrapper}>
                    <div className={STYLES.categoriesContainer}>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategorySelect(category)}
                                className={`${STYLES.categoryButton} ${
                                    selectedCategory?.id === category.id 
                                        ? STYLES.categoryButtonActive 
                                        : STYLES.categoryButtonInactive
                                }`}
                            >
                                <FiGrid className={STYLES.categoryIcon} />
                                <span className={STYLES.categoryName}>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal para móvil */}
            <CategoriesModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={categories}
                selectedCategory={selectedCategory || null}
                onCategorySelect={handleCategorySelect}
            />
        </div>
    );
}; 
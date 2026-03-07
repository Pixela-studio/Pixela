'use client';

import { MediaType } from '@/features/categories/types/media';
import { FiShuffle } from 'react-icons/fi';
import { MediaTypeSelectorProps } from '@/features/categories/types/components';

const STYLES = {
    // Contenedores principales
    container: 'flex flex-col gap-4 w-full sm:w-auto',
    buttonsContainer: 'grid grid-cols-3 sm:flex sm:flex-row gap-2 w-full',

    // Botones de tipo de media
    button: 'px-2 sm:px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-[13px] sm:text-sm md:text-base flex items-center justify-center',
    buttonActive: 'bg-pixela-accent/10 text-pixela-accent border border-pixela-accent/30',
    buttonInactive: 'bg-pixela-dark/20 text-pixela-light/60 border border-pixela-accent/10 hover:bg-pixela-accent/5 hover:text-pixela-accent/80',

    // Botón de recomendación aleatoria
    randomButton: 'col-span-3 sm:col-auto px-5 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm md:text-base flex items-center justify-center gap-2',
    randomButtonActive: 'bg-gradient-to-r from-pixela-accent/20 to-pixela-accent/30 text-pixela-accent border border-pixela-accent/30',
    randomButtonInactive: 'bg-pixela-dark/20 text-pixela-light/60 border border-pixela-accent/10 hover:bg-gradient-to-r hover:from-pixela-accent/10 hover:to-pixela-accent/20 hover:text-pixela-accent',
    randomDescription: 'max-w-md text-sm text-pixela-light/70 leading-relaxed px-2'
} as const;

/**
 * Componente selector de tipo de medio (películas/series/todos/random).
 * 
 * @component
 * @param {MediaTypeSelectorProps} props - Propiedades del componente
 * @returns {JSX.Element} El selector de tipo de medio renderizado
 */
export const MediaTypeSelector = ({ selectedType, onTypeChange }: MediaTypeSelectorProps) => {
    const options: { value: MediaType; label: string }[] = [
        { value: 'all', label: 'Todos' },
        { value: 'movies', label: 'Películas' },
        { value: 'series', label: 'Series' }
    ];

    return (
        <div className={STYLES.container}>
            <div className={STYLES.buttonsContainer}>
                {options.map(({ value, label }) => (
                    <button
                        key={value}
                        onClick={() => onTypeChange(value)}
                        className={`${STYLES.button} ${
                            selectedType === value
                                ? STYLES.buttonActive
                                : STYLES.buttonInactive
                        }`}
                    >
                        {label}
                    </button>
                ))}
                
                <button
                    onClick={() => onTypeChange('random')}
                    className={`${STYLES.randomButton} ${
                        selectedType === 'random'
                            ? STYLES.randomButtonActive
                            : STYLES.randomButtonInactive
                    }`}
                >
                    <FiShuffle className="w-4 h-4" />
                    Sorpréndeme
                </button>
            </div>
        </div>
    );
}; 
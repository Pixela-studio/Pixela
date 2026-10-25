'use client';

import { MediaType } from '@/features/categories/types/media';
import { FiShuffle } from 'react-icons/fi';
import { MediaTypeSelectorProps } from '@/features/categories/types/components';

const STYLES = {
    // Contenedores principales
    container: 'flex flex-col gap-4 w-full sm:w-auto',
    buttonsContainer: 'grid grid-cols-3 sm:flex sm:flex-row sm:flex-wrap gap-2 w-full',

    // Botones de tipo de media
    button: 'px-3 sm:px-5 h-10 rounded-full transition-colors duration-200 font-semibold text-sm flex items-center justify-center flex-1 sm:flex-none active:scale-[0.97]',
    buttonActive: 'bg-white text-pixela-dark',
    buttonInactive: 'bg-pixela-surface text-white/75 hover:bg-pixela-raised hover:text-white',

    // Botón de recomendación aleatoria
    randomButton: 'col-span-3 sm:col-auto px-5 h-10 rounded-full transition-colors duration-200 font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97]',
    randomButtonActive: 'bg-pixela-accent text-pixela-dark',
    randomButtonInactive: 'bg-pixela-surface text-white/75 hover:bg-pixela-raised hover:text-white',
    randomDescription: 'max-w-md text-sm text-gray-400 leading-relaxed'
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
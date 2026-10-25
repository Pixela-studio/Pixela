import { MediaTypeSelector } from './MediaTypeSelector';
import { MediaType } from '@/features/categories/types/media';
import { CategoriesHeaderProps } from '@/features/categories/types/components';

const STYLES = {
    container: 'flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-10 w-full',
    title: 'title-card text-[52px] sm:text-7xl md:text-[88px] xl:text-[104px] ls:text-5xl',
    controls: 'flex flex-col sm:flex-row gap-4 w-full xl:w-auto justify-end',
} as const;
    

/**
 * Obtiene el título correspondiente según el tipo de medio seleccionado
 * @param mediaType - El tipo de medio seleccionado
 * @returns El título a mostrar
 */
const getTitleByMediaType = (mediaType: MediaType | 'random'): string => {
    switch (mediaType) {
        case 'movies':
            return 'Películas';
        case 'series':
            return 'Series';
        case 'random':
            return 'Sorpréndeme';
        case 'all':
        default:
            return 'Categorías';
    }
};

/**
 * Componente de encabezado para la sección de categorías.
 * Muestra el título dinámico y el selector de tipo de medio.
 * 
 * @component
 * @param {CategoriesHeaderProps} props - Propiedades del componente
 * @returns {JSX.Element} El encabezado renderizado
 */
export const CategoriesHeader = ({ selectedMediaType, onMediaTypeChange }: CategoriesHeaderProps) => {
    return (
        <div className={STYLES.container}>
            <h1 className={STYLES.title}>{getTitleByMediaType(selectedMediaType)}</h1>
            <div className={STYLES.controls}>
                <MediaTypeSelector 
                    selectedType={selectedMediaType}
                    onTypeChange={onMediaTypeChange}
                />
            </div>
        </div>
    );
}; 
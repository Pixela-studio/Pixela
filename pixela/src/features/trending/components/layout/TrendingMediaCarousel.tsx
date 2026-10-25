'use client';
import { MediaCarousel } from '@/shared/components/MediaCarousel';
import { TrendingMediaCard } from '../content/TrendingMediaCard';
import type { TrendingMediaCarouselProps, TrendingMediaSlideProps } from '@/features/trending/types';
import { HEADER_LAYOUT_STYLES } from '@/shared/styles/headerStyles';


/**
 * Constantes de estilo para el carrusel de medios
 */
const STYLES = {
  container: 'trending-carousel mx-0',
  slides: HEADER_LAYOUT_STYLES.slides,
  slide: HEADER_LAYOUT_STYLES.slide,
} as const;

/**
 * Componente que renderiza un slide individual del carrusel
 * @param {TrendingMediaSlideProps} props - Props del componente
 * @returns {JSX.Element} Slide individual
 */
const TrendingMediaSlide = ({ item, type, index }: TrendingMediaSlideProps) => (
  <div className={STYLES.slide}>
    <TrendingMediaCard 
      media={item} 
      type={type} 
      index={index}
    />
  </div>
);

/**
 * Componente que renderiza el carrusel de medios en tendencia
 * @param {TrendingMediaCarouselProps} props - Props del componente
 * @returns {JSX.Element} Carrusel de medios
 */
export const TrendingMediaCarousel = ({ content, type }: TrendingMediaCarouselProps) => {
  return (
    <MediaCarousel
      className={STYLES.container}
      slidesClassName={STYLES.slides}
    >
      {content.map((item, index) => (
        <TrendingMediaSlide
          key={item.id}
          item={item}
          type={type}
          index={index}
        />
      ))}
    </MediaCarousel>
  );
}; 
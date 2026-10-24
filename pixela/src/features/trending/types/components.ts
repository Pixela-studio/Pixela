import type { TrendingSerie, TrendingMovie } from './media';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { MediaType } from './common';

/**
 * Props para el componente MediaInfoDetails
 * @property {TrendingSerie | TrendingMovie} media - Datos del medio
 * @property {MediaType} type - Tipo de medio (series o movies)
 */
export interface MediaInfoDetailsProps {
  media: TrendingSerie | TrendingMovie;
  type: MediaType;
}

/**
 * Props para el componente TrendingMediaCard
 * @property {TrendingSerie | TrendingMovie} media - Datos del medio a mostrar
 * @property {MediaType} type - Tipo de medio (series o películas)
 * @property {number} [index] - Índice opcional del medio en la lista
 */
export interface TrendingMediaCardProps {
  media: TrendingSerie | TrendingMovie;
  type: MediaType;
  index?: number;
}

/**
 * Props para el componente PosterImage
 * @property {string} posterPath - Ruta de la imagen del póster
 * @property {string} title - Título del medio
 * @property {boolean} isInitiallyVisible - Indica si el elemento debe cargarse prioritariamente
 */
export interface PosterImageProps {
  posterPath: string;
  title: string;
  isInitiallyVisible: boolean;
}

/**
 * Props para el componente OverlayContent
 * @property {TrendingSerie | TrendingMovie} media - Datos del medio
 * @property {MediaType} type - Tipo de medio (series o películas)
 */
export interface OverlayContentProps {
  media: TrendingSerie | TrendingMovie;
  type: MediaType;
}

/**
 * Props para el componente TrendingSection
 * @property {TrendingSerie[]} series - Lista de series en tendencia
 * @property {TrendingMovie[]} movies - Lista de películas en tendencia
 * @property {Object} quote - Cita relacionada con la sección de tendencias
 */
export interface TrendingSectionProps {
  series: TrendingSerie[];
  movies: TrendingMovie[];
  quote: {
    quote: string;
    author: string;
  };
}

/**
 * Props para el componente TrendingMediaCarousel
 * @property {(TrendingSerie | TrendingMovie)[]} content - Lista de medios a mostrar en el carrusel
 * @property {MediaType} type - Tipo de medio (series o películas)
 */
export interface TrendingMediaCarouselProps {
  content: (TrendingSerie | TrendingMovie)[];
  type: MediaType;
}

/**
 * Props para el componente TrendingMediaSlide
 * @property {TrendingSerie | TrendingMovie} item - Medio a mostrar en el slide
 * @property {MediaType} type - Tipo de medio (series o películas)
 * @property {number} index - Índice del slide en el carrusel
 */
export interface TrendingMediaSlideProps {
  item: TrendingSerie | TrendingMovie;
  type: MediaType;
  index: number;
}

/**
 * Props para el componente TrendingButton
 * Extiende las props nativas de un botón HTML
 * @property {boolean} isActive - Indica si el botón está activo
 * @property {React.ReactNode} children - Contenido del botón
 */
export interface TrendingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
  children: ReactNode;
}

/**
 * Props para el componente TrendingToggle
 * @property {MediaType} activeButton - El tipo de medio actualmente seleccionado
 * @property {(type: MediaType) => void} onButtonChange - Función para cambiar el tipo de medio
 */
export interface TrendingToggleProps {
  activeButton: MediaType;
  onButtonChange: (type: MediaType) => void;
} 
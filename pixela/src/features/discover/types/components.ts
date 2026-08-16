import { TrendingSerie, TrendingMovie } from "@/features/trending/types";

/**
 * Props del componente DiscoverSection
 * @interface DiscoverSectionProps
 * @property {TrendingSerie[]} series - Lista de series en tendencia
 * @property {TrendingMovie[]} movies - Lista de películas en tendencia
 */
export interface DiscoverSectionProps {
  series: TrendingSerie[];
  movies: TrendingMovie[];
}

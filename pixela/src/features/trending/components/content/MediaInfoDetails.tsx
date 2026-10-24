import { FaStar } from "react-icons/fa";
import { TrendingSerie, TrendingMovie } from "@/features/trending/types";
import { memo } from "react";
import { MediaInfoDetailsProps } from "@/features/trending/types/components";
import { MediaType } from "@/features/trending/types/common";

const STYLES = {
  container: 'mb-4',
  title: 'text-pixela-light font-bold text-xl mb-2',
  infoContainer: 'flex items-center gap-3 mb-3',
  rating: {
    container: 'flex items-center',
    icon: 'text-yellow-400 mr-1',
    value: 'text-pixela-light font-semibold'
  },
  year: 'text-pixela-light/80',
  badge: 'text-pixela-light/90 bg-pixela-dark/60 px-2 py-0.5 rounded-sm text-xs'
} as const;

const MEDIA_TYPE_LABELS = {
  series: 'Serie',
  movies: 'Película'
} as const;

/**
 * Componente de visualización de puntuación
 * @param {number} rating - Puntuación del medio
 * @returns {JSX.Element} Componente RatingDisplay
 */
const RatingDisplay = memo(({ rating }: { rating: number }) => (
  <div className={STYLES.rating.container}>
    <FaStar className={STYLES.rating.icon} />
    <span className={STYLES.rating.value}>
      {rating?.toFixed(1) || "N/A"}
    </span>
  </div>
));

RatingDisplay.displayName = 'RatingDisplay';

/**
 * Componente de etiqueta de tipo de medio
 * @param {MediaType} type - Tipo de medio
 * @returns {JSX.Element} Componente MediaTypeBadge
 */
const MediaTypeBadge = memo(({ type }: { type: MediaType }) => (
  <span className={STYLES.badge}>
    {MEDIA_TYPE_LABELS[type]}
  </span>
));

MediaTypeBadge.displayName = 'MediaTypeBadge';

/**
 * Componente de detalles de medio
 * @param {MediaInfoDetailsProps} props - Props del componente
 * @returns {JSX.Element} Componente MediaInfoDetails
 */
export const MediaInfoDetails = memo(({ media, type }: MediaInfoDetailsProps) => {
  const releaseDate = type === 'series' 
    ? (media as TrendingSerie).first_air_date 
    : (media as TrendingMovie).release_date;

  return (
    <div className={STYLES.container}>
      <h3 className={STYLES.title}>
        {type === 'series' 
          ? (media as TrendingSerie).name 
          : (media as TrendingMovie).title
        }
      </h3>
      
      <div className={STYLES.infoContainer}>
        <RatingDisplay rating={media.vote_average} />
        
        {releaseDate && (
          <span className={STYLES.year}>
            {releaseDate.split('-')[0]}
          </span>
        )}
        
        <MediaTypeBadge type={type} />
      </div>
    </div>
  );
});

MediaInfoDetails.displayName = 'MediaInfoDetails'; 
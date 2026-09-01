'use client';

import { FaBookmark } from "react-icons/fa";
import clsx from 'clsx';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';

const STYLES = {
  container: 'absolute top-3 right-3 z-50',
  button: {
    primary: {
      hero: 'flex items-center gap-2 bg-pixela-accent hover:bg-pixela-accent/90 text-white px-4 py-2 rounded-md transition-all duration-300 text-sm font-medium',
      default: 'flex-1 bg-pixela-accent hover:bg-pixela-accent/90 text-pixela-light py-2.5 rounded flex items-center justify-center gap-2 font-medium transition-colors'
    },
    secondary: {
      hero: 'flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-md backdrop-blur-sm transition-all duration-300 text-sm font-medium',
      default: 'w-10 h-10 flex items-center justify-center bg-pixela-dark hover:bg-pixela-dark/80 rounded text-pixela-light transition-colors border border-pixela-accent/40'
    },
    favorite: {
      active: 'p-2.5 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-lg bg-pixela-accent text-white hover:bg-pixela-accent/90',
      inactive: 'p-2.5 rounded-lg font-medium transition duration-300 flex items-center gap-2 shadow-lg bg-black/40 backdrop-blur-sm text-white hover:bg-black/50'
    }
  },
  icon: {
    hero: 'h-3 w-3',
    default: 'w-3.5 h-3.5',
    favorite: 'w-4 h-4 transition-all duration-300'
  }
} as const;

interface ActionButtonsProps {
  onInfoClick?: () => void;
  onFollowClick?: () => void;
  infoLabel?: string;
  followLabel?: string;
  variant?: 'hero' | 'default';
  followTitle?: string;
  tmdbId?: number;
  itemType?: 'movie' | 'series';
}

/**
 * Botones de acción sobre una tarjeta de película o serie.
 *
 * La lógica de favoritos vive en `useFavoriteToggle`, compartida con los
 * botones de la ficha de detalle.
 */
export const ActionButtons = ({
  onInfoClick,
  onFollowClick,
  infoLabel = "Más información",
  followLabel = "Seguir",
  variant = 'default',
  followTitle,
  tmdbId,
  itemType
}: ActionButtonsProps) => {
  const { isFavorited, isLoading, isAuthenticated, toggleFavorite } =
    useFavoriteToggle({ tmdbId, itemType });

  const isHero = variant === 'hero';
  const tracksFavorite = Boolean(tmdbId && itemType);

  const handleFollow = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!tracksFavorite) {
      onFollowClick?.();
      return;
    }

    void toggleFavorite();
  };

  // Sin estado conocido todavía: no pintamos un icono que luego cambie solo.
  if (isFavorited === null && isAuthenticated) return null;

  const label = isFavorited ? 'Quitar de favoritos' : 'Añadir a favoritos';

  return (
    <div className={STYLES.container}>
      {onInfoClick && (
        <button
          type="button"
          className={clsx(STYLES.button.primary[isHero ? 'hero' : 'default'])}
          onClick={onInfoClick}
        >
          {infoLabel}
        </button>
      )}
      <button
        type="button"
        className={clsx(
          tracksFavorite
            ? isFavorited
              ? STYLES.button.favorite.active
              : STYLES.button.favorite.inactive
            : STYLES.button.secondary[isHero ? 'hero' : 'default']
        )}
        onClick={handleFollow}
        title={followTitle || (tracksFavorite ? label : followLabel)}
        aria-label={tracksFavorite ? label : followLabel}
        aria-pressed={tracksFavorite ? Boolean(isFavorited) : undefined}
        disabled={isLoading}
      >
        <FaBookmark
          aria-hidden="true"
          className={
            tracksFavorite
              ? STYLES.icon.favorite
              : STYLES.icon[isHero ? 'hero' : 'default']
          }
        />
        {isHero && <span>{followLabel}</span>}
      </button>
    </div>
  );
};

export default ActionButtons;

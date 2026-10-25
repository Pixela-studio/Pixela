'use client';

import { FaBookmark } from "react-icons/fa";
import clsx from 'clsx';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';

const STYLES = {
  container: 'absolute top-3 right-3 z-50',
  button: {
    primary: {
      hero: 'btn btn-primary btn-sm',
      default: 'btn btn-primary btn-sm flex-1'
    },
    secondary: {
      hero: 'btn btn-ghost btn-sm',
      default: 'btn btn-ghost btn-sm w-10 px-0'
    },
    favorite: {
      active: 'p-2.5 rounded-sm font-medium transition duration-300 flex items-center gap-2 bg-white text-pixela-dark hover:bg-white/85',
      inactive: 'p-2.5 rounded-sm font-medium transition duration-300 flex items-center gap-2 bg-pixela-dark/80 text-white hover:bg-pixela-dark'
    }
  },
  icon: {
    hero: 'h-3 w-3',
    default: 'w-3.5 h-3.5',
    favorite: 'w-4 h-4 transition-[color,transform] duration-300'
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
  /** Título de la obra: entra en el nombre accesible del botón de favoritos. */
  mediaTitle?: string;
  /** Clases extra del contenedor (p. ej. la visibilidad hover/foco/táctil). */
  className?: string;
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
  itemType,
  mediaTitle,
  className
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

  // Con título, el lector de pantalla distingue un botón de otro en una rejilla.
  const label = mediaTitle
    ? isFavorited
      ? `Quitar «${mediaTitle}» de favoritos`
      : `Añadir «${mediaTitle}» a favoritos`
    : isFavorited
      ? 'Quitar de favoritos'
      : 'Añadir a favoritos';

  return (
    <div className={clsx(STYLES.container, className)}>
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

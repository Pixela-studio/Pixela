import { useCallback, useState } from "react";
import { favoritesAPI } from "@/api/favorites/favorites";
import type { FavoriteWithDetails } from "@/api/favorites/types";
import { useAsyncResource } from "@/hooks/useAsyncResource";
import { FiLoader, FiAlertCircle } from "react-icons/fi";
import { FaBookmark, FaTrash } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatYear } from "@/lib/date";

/**
 * URL base para las imágenes de TMDB
 */
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

/**
 * Mensajes de error constantes
 */
const ERROR_MESSAGES = {
  DELETE: "No se pudo eliminar el favorito",
  LOAD: "No se pudieron cargar los favoritos",
} as const;

interface ProfileFavoritesProps {
  onStatsUpdate?: () => void;
}

const EMPTY_FAVORITES: FavoriteWithDetails[] = [];

export const ProfileFavorites = ({ onStatsUpdate }: ProfileFavoritesProps) => {
  const fetchFavorites = useCallback(() => favoritesAPI.listWithDetails(), []);
  const {
    data: favorites,
    loading,
    error,
    setData: setFavorites,
    setError,
  } = useAsyncResource(fetchFavorites, EMPTY_FAVORITES, {
    errorMessage: ERROR_MESSAGES.LOAD,
    label: "favorites",
  });

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (e: React.MouseEvent, favoriteId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(favoriteId);
    try {
      await favoritesAPI.deleteFavorite(favoriteId);
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));
      onStatsUpdate?.();
    } catch {
      setError(ERROR_MESSAGES.DELETE);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <FiLoader className="w-8 h-8 text-pixela-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500">
        <FiAlertCircle className="w-6 h-6 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={<FaBookmark />}
        title="Todavía no tienes favoritos"
        description="Marca con el icono de marcador las películas y series que quieras tener siempre a mano."
        action={{ label: "Descubrir títulos", href: "/categories" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {favorites.map((fav) => (
        <div
          key={fav.id}
          className="relative group aspect-[2/3] rounded-lg overflow-hidden bg-gray-900 border border-white/5 transition-all hover:scale-105 hover:border-pixela-accent/50 hover:shadow-lg hover:shadow-pixela-accent/20"
        >
          <Link
            href={`/${fav.item_type === "movie" ? "movies" : "series"}/${fav.tmdb_id}`}
            className="block w-full h-full"
          >
            {fav.poster_path ? (
              <Image
                src={`${TMDB_IMAGE_BASE_URL}${fav.poster_path}`}
                alt={fav.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs text-center p-2">
                Sin imagen
              </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <h3 className="text-white text-sm font-semibold line-clamp-2 leading-tight mb-1">
                {fav.title}
              </h3>
              <p className="text-gray-400 text-xs">
                {formatYear(fav.release_date, "Sin fecha")}
              </p>
            </div>
          </Link>

          {/* Delete Button */}
          <button
            type="button"
            className="absolute top-2 right-2 translate-y-2 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-red-500/80 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title={`Eliminar «${fav.title}» de favoritos`}
            aria-label={`Eliminar «${fav.title}» de favoritos`}
            disabled={deletingId === fav.id}
            onClick={(e) => handleDelete(e, fav.id)}
          >
            {deletingId === fav.id ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FaTrash className="w-4 h-4" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
};

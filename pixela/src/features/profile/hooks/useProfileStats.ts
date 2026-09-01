import { useCallback } from "react";
import { FiHeart, FiStar, FiActivity } from "react-icons/fi";
import { favoritesAPI } from "@/api/favorites/favorites";
import { reviewsAPI } from "@/api/reviews/reviews";
import { useAsyncResource } from "@/hooks/useAsyncResource";

type ProfileStat = { label: string; value: string; icon: typeof FiHeart };

const INITIAL_STATS: ProfileStat[] = [
  { label: "Favoritos", value: "0", icon: FiHeart },
  { label: "Reseñas", value: "0", icon: FiStar },
  { label: "Nivel", value: "Novato", icon: FiActivity },
];

/** Umbrales de nivel, del más alto al más bajo: gana el primero que se cumple. */
const LEVELS: { name: string; reviews: number; favorites: number }[] = [
  { name: "Maestro", reviews: 50, favorites: 100 },
  { name: "Crítico", reviews: 30, favorites: 50 },
  { name: "Cinéfilo", reviews: 15, favorites: 30 },
  { name: "Aficionado", reviews: 5, favorites: 10 },
];

const resolveLevel = (reviewCount: number, favoriteCount: number): string =>
  LEVELS.find(
    (level) => reviewCount > level.reviews || favoriteCount > level.favorites,
  )?.name ?? "Novato";

export const useProfileStats = () => {
  const fetchStats = useCallback(async (): Promise<ProfileStat[]> => {
    const [favorites, reviews] = await Promise.all([
      favoritesAPI.listWithDetails(),
      reviewsAPI.list(),
    ]);

    return [
      { label: "Favoritos", value: String(favorites.length), icon: FiHeart },
      { label: "Reseñas", value: String(reviews.length), icon: FiStar },
      {
        label: "Nivel",
        value: resolveLevel(reviews.length, favorites.length),
        icon: FiActivity,
      },
    ];
  }, []);

  const { data: stats, loading, reload } = useAsyncResource(
    fetchStats,
    INITIAL_STATS,
    { errorMessage: "No se pudieron cargar las estadísticas", label: "profile stats" },
  );

  return { stats, loading, refreshStats: reload };
};

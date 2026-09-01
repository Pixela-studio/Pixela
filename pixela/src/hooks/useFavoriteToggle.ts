"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { favoritesAPI } from "@/api/favorites/favorites";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/lib/toast";
import { logger } from "@/lib/logger";

interface UseFavoriteToggleOptions {
  tmdbId?: number;
  itemType?: "movie" | "series";
}

/**
 * Estado y alternancia del favorito de un título.
 *
 * `shared/components/ActionButtons` y
 * `features/media/components/hero/actions/ActionButtons` implementaban esto por
 * duplicado: el mismo efecto de carga, el mismo `find` sobre la lista completa y
 * el mismo bloque de toggle con su manejo de 401.
 *
 * Cambio de comportamiento: tras añadir o quitar ya no se vuelve a pedir la
 * lista entera. Ese refetch obligaba al servidor a resolver los metadatos de
 * TMDB de *todos* los favoritos del usuario solo para saber el estado de uno.
 * Ahora se actualiza el estado local con lo que devuelve la propia mutación.
 */
export function useFavoriteToggle({ tmdbId, itemType }: UseFavoriteToggleOptions) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // `null` = todavía no sabemos; permite no pintar un estado equivocado.
  const [isFavorited, setIsFavorited] = useState<boolean | null>(null);
  const [favoriteId, setFavoriteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tmdbId || !itemType || !isAuthenticated) {
      setIsFavorited(false);
      setFavoriteId(null);
      return;
    }

    // Evita escribir estado sobre un componente ya desmontado si el usuario
    // navega mientras la petición está en vuelo.
    let active = true;

    favoritesAPI
      .listWithDetails()
      .then((favorites) => {
        if (!active) return;
        const match = favorites.find(
          (favorite) =>
            favorite.tmdb_id === tmdbId && favorite.item_type === itemType,
        );
        setIsFavorited(Boolean(match));
        setFavoriteId(match?.id ?? null);
      })
      .catch((error) => {
        if (!active) return;
        logger.error("Error checking favorite status", error);
        setIsFavorited(false);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, tmdbId, itemType]);

  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      toast.info("Inicia sesión para agregar a favoritos", {
        title: "Autenticación requerida",
        duration: 3000,
      });
      router.push("/login");
      return;
    }

    if (!tmdbId || !itemType || isLoading) return;

    setIsLoading(true);

    try {
      if (isFavorited && favoriteId) {
        await favoritesAPI.deleteFavorite(favoriteId);
        setIsFavorited(false);
        setFavoriteId(null);
      } else {
        const created = await favoritesAPI.addFavorite({
          tmdb_id: tmdbId,
          item_type: itemType,
        });
        setIsFavorited(true);
        setFavoriteId(created.id);
      }
    } catch (error) {
      logger.error("Error toggling favorite", error);

      if (error instanceof Error && error.message.includes("401")) {
        router.push("/login");
        return;
      }

      toast.error("No se pudo actualizar tus favoritos");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, tmdbId, itemType, isFavorited, favoriteId, isLoading, router]);

  return { isFavorited, isLoading, isAuthenticated, toggleFavorite };
}

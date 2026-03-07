import { FavoriteWithDetails, Favorite, CreateFavorite } from "./types";

import { API_ENDPOINTS } from "../shared/apiEndpoints";
import { fetchFromAPI } from "../shared/apiHelpers";

/**
 * Caché en memoria para evitar peticiones duplicadas de favoritos.
 * Múltiples instancias de ActionButtons en la misma página comparten este resultado.
 * TTL: 30 segundos. Se invalida automáticamente al añadir o eliminar favoritos.
 */
let favoritesCache: {
  data: FavoriteWithDetails[] | null;
  timestamp: number;
} = { data: null, timestamp: 0 };

const CACHE_TTL_MS = 30_000; // 30 segundos

const isCacheValid = () =>
  favoritesCache.data !== null &&
  Date.now() - favoritesCache.timestamp < CACHE_TTL_MS;

const invalidateCache = () => {
  favoritesCache = { data: null, timestamp: 0 };
};

/**
 * API para favoritos
 * @namespace favoritesAPI
 */
export const favoritesAPI = {
  async listWithDetails(): Promise<FavoriteWithDetails[]> {
    // Devolver caché si está vigente — evita N peticiones simultáneas
    if (isCacheValid()) {
      return favoritesCache.data!;
    }

    const response = await fetchFromAPI<{
      success: boolean;
      data: FavoriteWithDetails[];
    }>(API_ENDPOINTS.FAVORITES.DETAILS);

    favoritesCache = { data: response.data, timestamp: Date.now() };
    return response.data;
  },

  async addFavorite(favorite: CreateFavorite): Promise<Favorite> {
    invalidateCache(); // Invalidar caché al modificar favoritos
    return fetchFromAPI<Favorite>(API_ENDPOINTS.FAVORITES.ADD, {
      method: "POST",
      body: JSON.stringify({
        tmdb_id: favorite.tmdb_id,
        item_type: favorite.item_type,
      }),
    });
  },

  async deleteFavorite(favoriteId: number): Promise<void> {
    invalidateCache(); // Invalidar caché al modificar favoritos
    await fetchFromAPI(
      API_ENDPOINTS.FAVORITES.DELETE.replace(":id", String(favoriteId)),
      { method: "DELETE" },
    );
  },
};
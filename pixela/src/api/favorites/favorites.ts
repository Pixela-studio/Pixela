import { FavoriteWithDetails, Favorite, CreateFavorite } from "./types";
import { API_ENDPOINTS } from "../shared/apiEndpoints";
import { fetchFromAPI } from "../shared/apiHelpers";

/**
 * Caché en memoria compartida por todos los marcadores de la página.
 *
 * Guarda también la **promesa en vuelo**: antes solo se guardaba el resultado,
 * así que las veinte tarjetas de una fila preguntaban a la vez, todas veían la
 * caché vacía y salían veinte peticiones iguales. Ahora la primera sale y las
 * demás esperan a esa. TTL de 30 s; se invalida al añadir o quitar.
 */
const CACHE_TTL_MS = 30_000;

interface CacheEntry<T> {
  data: T | null;
  timestamp: number;
  inFlight: Promise<T> | null;
}

const emptyEntry = <T,>(): CacheEntry<T> => ({ data: null, timestamp: 0, inFlight: null });

let idsCache: CacheEntry<Favorite[]> = emptyEntry();
let detailsCache: CacheEntry<FavoriteWithDetails[]> = emptyEntry();

const invalidateCache = () => {
  idsCache = emptyEntry();
  detailsCache = emptyEntry();
};

function cached<T>(
  getEntry: () => CacheEntry<T>,
  load: () => Promise<T>,
): Promise<T> {
  const entry = getEntry();
  if (entry.data !== null && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return Promise.resolve(entry.data);
  }
  if (entry.inFlight) return entry.inFlight;

  const promise = load()
    .then((data) => {
      // Si se invalidó mientras tanto, no se escribe en la entrada nueva.
      if (getEntry() === entry) {
        entry.data = data;
        entry.timestamp = Date.now();
      }
      return data;
    })
    .finally(() => {
      entry.inFlight = null;
    });
  entry.inFlight = promise;
  return promise;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

/**
 * API para favoritos
 * @namespace favoritesAPI
 */
export const favoritesAPI = {
  /** Favoritos con los datos de TMDB, para la pestaña del perfil. */
  listWithDetails(): Promise<FavoriteWithDetails[]> {
    return cached(
      () => detailsCache,
      async () =>
        (await fetchFromAPI<ApiEnvelope<FavoriteWithDetails[]>>(API_ENDPOINTS.FAVORITES.DETAILS))
          .data,
    );
  },

  /** Solo ids: lo que necesita un marcador para saber si está activo. */
  listIds(): Promise<Favorite[]> {
    return cached(
      () => idsCache,
      async () => (await fetchFromAPI<ApiEnvelope<Favorite[]>>(API_ENDPOINTS.FAVORITES.LIST)).data,
    );
  },

  /**
   * Devuelve el favorito creado.
   *
   * Antes se tipaba el resultado como `Favorite` cuando en realidad la ruta
   * responde `{ success, data }`, así que `favorite.id` llegaba `undefined` en
   * tiempo de ejecución pese a compilar. Ahora se desenvuelve la respuesta.
   */
  async addFavorite(favorite: CreateFavorite): Promise<Favorite> {
    invalidateCache();

    const response = await fetchFromAPI<ApiEnvelope<Favorite>>(
      API_ENDPOINTS.FAVORITES.ADD,
      {
        method: "POST",
        body: JSON.stringify({
          tmdb_id: favorite.tmdb_id,
          item_type: favorite.item_type,
        }),
      },
    );

    return response.data;
  },

  async deleteFavorite(favoriteId: number): Promise<void> {
    invalidateCache();
    await fetchFromAPI(
      API_ENDPOINTS.FAVORITES.DELETE.replace(":id", String(favoriteId)),
      { method: "DELETE" },
    );
  },
};

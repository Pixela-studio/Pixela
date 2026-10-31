import { API_ENDPOINTS } from "../shared/apiEndpoints";
import { fetchFromAPI } from "../shared/apiHelpers";

export type ListVisibility = "PRIVATE" | "LINK" | "PUBLIC";

export interface ListItem {
  id: number;
  tmdb_id: number;
  item_type: "movie" | "series";
  position: number;
  note: string | null;
  added_at: string;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
}

export interface UserList {
  id: number;
  name: string;
  description: string | null;
  visibility: ListVisibility;
  share_id: string;
  created_at: string;
  updated_at: string;
  item_count: number;
  owner: { name: string; photo_url?: string };
  /** En el índice, solo los cuatro primeros (la portada). */
  items: ListItem[];
  /** Solo al pedir las listas para un título concreto. */
  contains_item_id?: number | null;
}

export const VISIBILITY_LABELS: Record<ListVisibility, { label: string; hint: string }> = {
  PRIVATE: { label: "Privada", hint: "Solo la ves tú." },
  LINK: { label: "Con enlace", hint: "La ve quien tenga el enlace. No sale en buscadores." },
  PUBLIC: { label: "Pública", hint: "Cualquiera puede verla y compartirla." },
};

interface Envelope<T> {
  success: boolean;
  data: T;
}

const listUrl = (id: number) => `${API_ENDPOINTS.LISTS}/${id}`;

/** Cliente de las listas con nombre (`/api/lists/**`). */
export const listsAPI = {
  async mine(forTitle?: { tmdbId: number; itemType: "movie" | "series" }): Promise<UserList[]> {
    const query = forTitle ? `?tmdb_id=${forTitle.tmdbId}&item_type=${forTitle.itemType}` : "";
    return (await fetchFromAPI<Envelope<UserList[]>>(`${API_ENDPOINTS.LISTS}${query}`)).data;
  },

  async get(id: number): Promise<UserList> {
    return (await fetchFromAPI<Envelope<UserList>>(listUrl(id))).data;
  },

  async create(input: { name: string; description?: string; visibility?: ListVisibility }): Promise<UserList> {
    return (
      await fetchFromAPI<Envelope<UserList>>(API_ENDPOINTS.LISTS, {
        method: "POST",
        body: JSON.stringify(input),
      })
    ).data;
  },

  async update(
    id: number,
    input: Partial<{ name: string; description: string; visibility: ListVisibility }>,
  ): Promise<UserList> {
    return (
      await fetchFromAPI<Envelope<UserList>>(listUrl(id), { method: "PATCH", body: JSON.stringify(input) })
    ).data;
  },

  async remove(id: number): Promise<void> {
    await fetchFromAPI(listUrl(id), { method: "DELETE" });
  },

  async addItem(listId: number, item: { tmdb_id: number; item_type: "movie" | "series"; note?: string }) {
    return (
      await fetchFromAPI<Envelope<{ id: number }>>(`${listUrl(listId)}/items`, {
        method: "POST",
        body: JSON.stringify(item),
      })
    ).data;
  },

  async removeItem(listId: number, itemId: number): Promise<void> {
    await fetchFromAPI(`${listUrl(listId)}/items/${itemId}`, { method: "DELETE" });
  },

  async reorder(listId: number, itemIds: number[]): Promise<void> {
    await fetchFromAPI(`${listUrl(listId)}/items`, {
      method: "PUT",
      body: JSON.stringify({ item_ids: itemIds }),
    });
  },
};

/** Ruta pública de una lista. */
export const listPath = (shareId: string) => `/listas/${shareId}`;

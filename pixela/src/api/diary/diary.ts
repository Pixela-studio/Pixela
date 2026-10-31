import { API_ENDPOINTS } from "../shared/apiEndpoints";
import { fetchFromAPI } from "../shared/apiHelpers";

export interface DiaryEntry {
  id: number;
  tmdb_id: number;
  item_type: "movie" | "series";
  /** `AAAA-MM-DD`. */
  watched_on: string;
  /** De 0 a 10, como las reseñas. */
  rating: number | null;
  note: string | null;
  rewatch: boolean;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export interface NewDiaryEntry {
  tmdb_id: number;
  item_type: "movie" | "series";
  watched_on: string;
  rating?: number | null;
  note?: string;
  rewatch?: boolean;
  mark_completed?: boolean;
}

/** Cliente del diario de visionado (`/api/diary`). */
export const diaryAPI = {
  async list(options: { before?: number; tmdbId?: number; itemType?: "movie" | "series" } = {}) {
    const params = new URLSearchParams();
    if (options.before) params.set("before", String(options.before));
    if (options.tmdbId && options.itemType) {
      params.set("tmdb_id", String(options.tmdbId));
      params.set("item_type", options.itemType);
    }
    const query = params.toString();
    return fetchFromAPI<{ success: boolean; data: DiaryEntry[]; has_more: boolean }>(
      `${API_ENDPOINTS.DIARY}${query ? `?${query}` : ""}`,
    );
  },

  async add(entry: NewDiaryEntry) {
    return (
      await fetchFromAPI<{ success: boolean; data: { id: number; rewatch: boolean } }>(API_ENDPOINTS.DIARY, {
        method: "POST",
        body: JSON.stringify(entry),
      })
    ).data;
  },

  async remove(id: number): Promise<void> {
    await fetchFromAPI(`${API_ENDPOINTS.DIARY}/${id}`, { method: "DELETE" });
  },
};

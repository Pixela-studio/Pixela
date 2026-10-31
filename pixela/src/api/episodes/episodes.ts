import { API_ENDPOINTS } from "../shared/apiEndpoints";
import { fetchFromAPI } from "../shared/apiHelpers";

export interface SeasonEpisode {
  episode: number;
  name: string;
  air_date: string | null;
  runtime: number | null;
}

export interface SeasonDetail {
  season: number;
  name: string;
  episodes: SeasonEpisode[];
}

/** Clave de un capítulo: `"2x05"`. */
export const episodeKey = (season: number, episode: number) => `${season}x${episode}`;

/** Capítulos de una serie y cuáles se han visto. */
export const episodesAPI = {
  async season(seriesId: number, season: number): Promise<SeasonDetail> {
    return (
      await fetchFromAPI<{ success: boolean; data: SeasonDetail }>(
        `${API_ENDPOINTS.SERIES.GET_BY_ID(String(seriesId))}/season/${season}`,
      )
    ).data;
  },

  async watched(seriesId: number): Promise<Set<string>> {
    const response = await fetchFromAPI<{ success: boolean; data: Array<[number, number]> }>(
      `${API_ENDPOINTS.EPISODES}?tmdb_id=${seriesId}`,
    );
    return new Set(response.data.map(([season, episode]) => episodeKey(season, episode)));
  },

  async toggle(seriesId: number, season: number, episodes: number[], watched: boolean) {
    return (
      await fetchFromAPI<{ success: boolean; data: { watched_count: number } }>(API_ENDPOINTS.EPISODES, {
        method: "POST",
        body: JSON.stringify({ tmdb_id: seriesId, season, episodes, watched }),
      })
    ).data;
  },
};

export enum WatchStatus {
  PLAN_TO_WATCH = "PLAN_TO_WATCH",
  WATCHING = "WATCHING",
  COMPLETED = "COMPLETED",
  DROPPED = "DROPPED",
}

export enum ItemType {
  movie = "movie",
  series = "series",
}

export interface LibraryItem {
  id: number;
  user_id: number;
  item_type: "movie" | "series";
  tmdb_id: number;
  status: WatchStatus;
  created_at: string;
  updated_at: string;
}

export interface LibraryItemWithDetails extends LibraryItem {
  /** Solo series: capítulos marcados como vistos. */
  episodes_watched?: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  vote_average: number;
}

export interface AddLibraryItemDTO {
  tmdb_id: number;
  item_type: "movie" | "series";
  status?: WatchStatus;
}

export interface CheckLibraryResponse {
  inLibrary: boolean;
  data?: LibraryItem;
  error?: string;
}

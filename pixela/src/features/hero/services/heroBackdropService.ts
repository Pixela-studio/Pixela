import { fetchFromTmdb } from "@/lib/tmdb";
import { tmdbImageHelpers, TMDB_IMAGE_CONFIG } from "@/lib/constants/tmdb";
import { HeroImage } from "@/features/hero/types/content";

interface TmdbResult {
  id: number;
  backdrop_path: string | null;
  poster_path: string | null;
  title?: string;
  name?: string;
  overview?: string;
  media_type?: "movie" | "tv";
}

interface TmdbResponse {
  results: TmdbResult[];
}

/**
 * Editorial pool — TMDB movie IDs hand-picked because their backdrops read
 * as cinematic frames (good framing, contrast, no burned-in text). One of
 * these lands in slot 0 every request, so the first hero impression is
 * always controlled while still varying between page loads.
 *
 * To add a new pick: open the movie on TMDB, copy the numeric ID from the
 * URL, drop it here. Any ID that 404s is silently skipped.
 */
const EDITORIAL_MOVIE_IDS: readonly number[] = [
  1317288, // Marty Supreme
];

/**
 * Blacklist de títulos que suelen aparecer en trending con backdrops pobres
 * (procedurals, infantiles con arte muy plano, promos con texto quemado).
 */
const BANNED_TITLE_TERMS: readonly string[] = [
  "primal",
  "monster high",
  "barbie",
  "primate",
  "apes",
  "simios",
  "law & order",
  "ley y orden",
  "hermandad",
  "turno de noche",
  "night shift",
  "joven sherlock",
  "young sherlock",
  "hoppers",
  "dinosaur",
  "dinosaurio",
];

const HERO_SLOT_COUNT = 4;

function mapTmdbToHeroImage(
  item: TmdbResult,
  fallbackType?: "movie" | "serie",
): HeroImage | null {
  if (!item.backdrop_path || !item.poster_path) return null;
  const rawType = item.media_type === "tv" ? "serie" : item.media_type;
  return {
    id: item.id,
    backdrop: tmdbImageHelpers.backdrop(
      item.backdrop_path,
      TMDB_IMAGE_CONFIG.SIZES.BACKDROP.ORIGINAL,
    ),
    poster: tmdbImageHelpers.poster(
      item.poster_path,
      TMDB_IMAGE_CONFIG.SIZES.POSTER.W780,
    ),
    title: item.title || item.name,
    description: item.overview,
    type: rawType || fallbackType || "movie",
  };
}

function passesQualityFilter(item: TmdbResult): boolean {
  const title = (item.title || item.name || "").toLowerCase();
  if (!title) return false;
  if (!item.overview) return false;
  return !BANNED_TITLE_TERMS.some((term) => title.includes(term));
}

async function fetchAndMapFromEndpoint(
  endpoint: string,
  fallbackType?: "movie" | "serie",
): Promise<HeroImage[]> {
  try {
    const data = await fetchFromTmdb<TmdbResponse>(endpoint);
    return data.results
      .filter(passesQualityFilter)
      .map((item) => mapTmdbToHeroImage(item, fallbackType))
      .filter((img): img is HeroImage => img !== null);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[Hero] Failed to fetch ${endpoint}:`, error);
    }
    return [];
  }
}

/**
 * Elige 1 pick editorial al azar. Si el pool está vacío o la petición falla,
 * devuelve null y el hero cae a trending.
 */
async function fetchOneEditorialPick(): Promise<HeroImage | null> {
  if (EDITORIAL_MOVIE_IDS.length === 0) return null;
  const id =
    EDITORIAL_MOVIE_IDS[Math.floor(Math.random() * EDITORIAL_MOVIE_IDS.length)];
  try {
    const item = await fetchFromTmdb<TmdbResult>(`movie/${id}`);
    return mapTmdbToHeroImage(item, "movie");
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[Hero] Editorial pick ${id} failed:`, error);
    }
    return null;
  }
}

/**
 * Devuelve las imágenes destacadas del hero.
 *
 * Estrategia:
 * 1. Slot 0: pick editorial (garantiza primer frame controlado).
 * 2. Slots 1..N: top-rated (backdrops consistentemente buenos) fusionado
 *    con trending del día (contenido fresco).
 * 3. Deduplicado por backdrop y capado a HERO_SLOT_COUNT.
 * 4. Si todo falla, se devuelve array vacío y la UI lo maneja.
 */
export async function getFeaturedImages(): Promise<HeroImage[]> {
  try {
    const [editorial, topRated, trending] = await Promise.all([
      fetchOneEditorialPick(),
      fetchAndMapFromEndpoint("movie/top_rated", "movie"),
      fetchAndMapFromEndpoint("trending/all/day"),
    ]);

    // Mezcla top-rated + trending manteniendo variedad en las primeras posiciones.
    const rest: HeroImage[] = [];
    const maxLen = Math.max(topRated.length, trending.length);
    for (let i = 0; i < maxLen; i++) {
      if (trending[i]) rest.push(trending[i]);
      if (topRated[i]) rest.push(topRated[i]);
    }

    const combined = editorial ? [editorial, ...rest] : rest;

    const unique = Array.from(
      new Map(combined.map((img) => [img.backdrop, img])).values(),
    );

    return unique.slice(0, HERO_SLOT_COUNT);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Hero] Fatal error fetching hero images:", error);
    }
    return [];
  }
}

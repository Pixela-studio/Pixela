import { NextResponse } from "next/server";
import { fetchFromTmdb } from "@/lib/tmdb";
import { auth } from "@/auth";

interface TmdbItem {
  backdrop_path: string | null;
  title?: string;
  name?: string;
  vote_average: number;
}

interface TmdbResponse {
  results: TmdbItem[];
}

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/original";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Fetch trending movies and series
    const [trendingMovies, trendingSeries] = await Promise.all([
      fetchFromTmdb<TmdbResponse>("trending/movie/week"),
      fetchFromTmdb<TmdbResponse>("trending/tv/week"),
    ]);

    // Combine and filter items with backdrops
    const allItems = [
      ...trendingMovies.results,
      ...trendingSeries.results,
    ].filter((item) => item.backdrop_path !== null);

    // Sort by popularity/rating (optional, utilizing index or vote_average)
    allItems.sort((a, b) => b.vote_average - a.vote_average);

    // Select unique backdrops (some items might be in both lists or duplicates logic avoided by Set)
    const uniqueBackdrops = new Map<string, string>();

    for (const item of allItems) {
      if (uniqueBackdrops.size >= 20) break;
      if (item.backdrop_path) {
        // Use original quality for banners
        uniqueBackdrops.set(
          item.backdrop_path,
          `${TMDB_IMAGE_BASE_URL}${item.backdrop_path}`,
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        banners: Array.from(uniqueBackdrops.values()),
      },
      {
        /*
         * `private`: la respuesta depende de la sesión, así que la cachea el
         * navegador y no una CDN compartida. Basta para que abrir y cerrar el
         * selector de banner varias veces no repita la petición.
         */
        headers: { "Cache-Control": "private, max-age=3600" },
      },
    );
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Error al obtener banners" },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { fetchFromTmdb } from "@/lib/tmdb";

interface TmdbMediaDetails {
  title?: string;
  name?: string;
  poster_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Obtener detalles de TMDB para cada favorito
    const favoritesWithDetails = await Promise.all(
      favorites.map(async (fav) => {
        try {
          const tmdbType = fav.itemType === "movie" ? "movie" : "tv";
          const data = await fetchFromTmdb<TmdbMediaDetails>(
            `${tmdbType}/${fav.tmdbId}`,
          );

          return {
            id: fav.id,
            user_id: fav.userId,
            tmdb_id: Number(fav.tmdbId),
            item_type: fav.itemType,
            title: data.title || data.name || "Sin título",
            poster_path: data.poster_path,
            overview: data.overview,
            release_date: data.release_date || data.first_air_date,
            vote_average: data.vote_average,
          };
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error(
              `Error fetching TMDB details for ${fav.itemType} ${fav.tmdbId}:`,
              error,
            );
          }
          // Retornar objeto básico si falla el fetch individual para no romper la lista
          return {
            id: fav.id,
            user_id: fav.userId,
            tmdb_id: Number(fav.tmdbId),
            item_type: fav.itemType,
            title: "Error al cargar detalles",
            poster_path: null,
            overview: "",
            release_date: "",
            vote_average: 0,
          };
        }
      }),
    );

    return NextResponse.json({
      success: true,
      data: favoritesWithDetails,
    });
  } catch (error) {
    console.error("Error listing favorites with details:", error);
    return NextResponse.json(
      { error: "Error al listar favoritos" },
      { status: 500 },
    );
  }
}

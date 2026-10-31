import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import { apiError, handleRouteError } from "@/lib/api/responses";

/**
 * Descarga de todos los datos de la cuenta (derecho de acceso y portabilidad,
 * arts. 15 y 20 del RGPD).
 *
 * Un JSON con todo lo del usuario: cuenta, favoritos, biblioteca, reseñas,
 * listas, diario y capítulos vistos. Nunca incluye el hash de la
 * contraseña ni la versión de sesión: no son datos "suyos" sino mecanismos de
 * seguridad, y el fichero puede acabar en cualquier carpeta de descargas.
 */
export async function GET() {
  const guard = await requireUser();
  if (!guard.ok) return guard.response;
  const { id } = guard.user;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        name: true,
        email: true,
        photoUrl: true,
        coverImage: true,
        isAdmin: true,
        termsAcceptedAt: true,
        createdAt: true,
        updatedAt: true,
        favorites: { select: { itemType: true, tmdbId: true, createdAt: true } },
        libraryItems: {
          select: { itemType: true, tmdbId: true, status: true, createdAt: true, updatedAt: true },
        },
        reviews: {
          select: {
            itemType: true,
            tmdbId: true,
            rating: true,
            review: true,
            isPublic: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        lists: {
          select: {
            name: true,
            description: true,
            visibility: true,
            createdAt: true,
            items: {
              select: { itemType: true, tmdbId: true, position: true, note: true, addedAt: true },
              orderBy: { position: "asc" },
            },
          },
        },
        diaryEntries: {
          select: { itemType: true, tmdbId: true, watchedOn: true, rating: true, note: true, rewatch: true },
          orderBy: { watchedOn: "asc" },
        },
        episodeWatches: {
          select: { tmdbId: true, season: true, episode: true, watchedAt: true },
          orderBy: [{ tmdbId: "asc" }, { season: "asc" }, { episode: "asc" }],
        },
      },
    });

    if (!user) return apiError("Usuario no encontrado", 404);

    const exportedAt = new Date().toISOString();
    const data = {
      exported_at: exportedAt,
      source: "Pixela",
      note: "Los títulos se identifican con su id de The Movie Database (themoviedb.org).",
      account: {
        name: user.name,
        email: user.email,
        photo_url: user.photoUrl,
        cover_url: user.coverImage,
        is_admin: user.isAdmin,
        terms_accepted_at: user.termsAcceptedAt,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      },
      favorites: user.favorites.map((f) => ({
        item_type: f.itemType,
        tmdb_id: f.tmdbId.toString(),
        created_at: f.createdAt,
      })),
      library: user.libraryItems.map((item) => ({
        item_type: item.itemType,
        tmdb_id: item.tmdbId.toString(),
        status: item.status,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
      })),
      reviews: user.reviews.map((r) => ({
        item_type: r.itemType,
        tmdb_id: r.tmdbId.toString(),
        rating: Number(r.rating),
        review: r.review,
        is_public: r.isPublic,
        created_at: r.createdAt,
        updated_at: r.updatedAt,
      })),
      lists: user.lists.map((list) => ({
        name: list.name,
        description: list.description,
        visibility: list.visibility,
        created_at: list.createdAt,
        items: list.items.map((item) => ({
          item_type: item.itemType,
          tmdb_id: item.tmdbId.toString(),
          position: item.position,
          note: item.note,
          added_at: item.addedAt,
        })),
      })),
      diary: user.diaryEntries.map((entry) => ({
        item_type: entry.itemType,
        tmdb_id: entry.tmdbId.toString(),
        watched_on: entry.watchedOn.toISOString().slice(0, 10),
        rating: entry.rating === null ? null : Number(entry.rating),
        note: entry.note,
        rewatch: entry.rewatch,
      })),
      episodes_watched: user.episodeWatches.map((watch) => ({
        tmdb_id: watch.tmdbId.toString(),
        season: watch.season,
        episode: watch.episode,
        watched_at: watch.watchedAt,
      })),
    };

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="pixela-mis-datos-${exportedAt.slice(0, 10)}.json"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return handleRouteError("Failed to export user data", error, { userId: id });
  }
}

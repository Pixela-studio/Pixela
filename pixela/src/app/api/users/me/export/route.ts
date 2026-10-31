import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireUser } from "@/lib/api/guards";
import { apiError, handleRouteError } from "@/lib/api/responses";

/**
 * Descarga de todos los datos de la cuenta (derecho de acceso y portabilidad,
 * arts. 15 y 20 del RGPD).
 *
 * Un JSON con las cuatro tablas del usuario. Nunca incluye el hash de la
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
            createdAt: true,
            updatedAt: true,
          },
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
        created_at: r.createdAt,
        updated_at: r.updatedAt,
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

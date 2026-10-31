import { ImageResponse } from "next/og";
import prisma from "@/lib/prisma";
import { apiError, handleRouteError } from "@/lib/api/responses";
import { resourceIdSchema } from "@/lib/api/schemas";
import { fetchFromTmdb } from "@/lib/tmdb";
import { tmdbImageHelpers } from "@/lib/constants/tmdb";
import { formatYear } from "@/lib/date";

const SIZE = 1080;
const TEXT_MAX = 420;

interface TmdbTitle {
  title?: string;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  first_air_date?: string;
}

const STAR_PATH =
  "M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21.2l1.6-7L2 9.5l7.1-.6z";

/**
 * Cinco estrellas en SVG: la fuente por defecto de `next/og` no tiene el
 * glifo ★ y salían cuadros vacíos. La media estrella es una amarilla recortada
 * a la mitad encima de una gris.
 */
function Stars({ rating }: { rating: number }) {
  const halves = Math.round(rating);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {Array.from({ length: 5 }, (_, i) => {
        const fill = halves - i * 2;
        return (
          <div key={i} style={{ display: "flex", position: "relative", width: 52, height: 52 }}>
            <svg width="52" height="52" viewBox="0 0 24 24" style={{ position: "absolute", top: 0, left: 0 }}>
              <path d={STAR_PATH} fill="#3A332D" />
            </svg>
            {fill > 0 && (
              <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: fill >= 2 ? 52 : 26, height: 52, overflow: "hidden" }}>
                <svg width="52" height="52" viewBox="0 0 24 24">
                  <path d={STAR_PATH} fill="#FACC15" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
      <span style={{ marginLeft: 12, fontSize: 36, color: "#A8A29E" }}>
        {(halves / 2).toLocaleString("es-ES")} / 5
      </span>
    </div>
  );
}

/**
 * GET /api/reviews/:id/image — la reseña como imagen cuadrada (1080 px) para
 * Instagram o WhatsApp: póster, título, nota, el texto y quién la escribió.
 * Nuria la pedía para su cuenta de recomendaciones.
 *
 * Solo para reseñas públicas: una «solo para mí» no tiene imagen. La URL lleva
 * `?v=` con la fecha de edición, así que se puede cachear largo.
 */
export async function GET(_request: Request, props: { params: Promise<{ id: string }> }) {
  const id = resourceIdSchema.safeParse((await props.params).id);
  if (!id.success) return apiError("ID inválido", 400);

  try {
    const review = await prisma.review.findFirst({
      where: { id: id.data, isPublic: true },
      include: { user: { select: { name: true } } },
    });
    if (!review) return apiError("Reseña no encontrada", 404);

    const media = await fetchFromTmdb<TmdbTitle>(
      `${review.itemType === "movie" ? "movie" : "tv"}/${review.tmdbId}`,
    ).catch(() => null);

    const title = media?.title ?? media?.name ?? "";
    const year = formatYear(media?.release_date ?? media?.first_air_date, "");
    const poster = media?.poster_path ? tmdbImageHelpers.poster(media.poster_path, "w500") : null;
    const rating = Number(review.rating);
    const text = (review.review ?? "").trim();
    const excerpt = text.length > TEXT_MAX ? `${text.slice(0, TEXT_MAX - 1).trimEnd()}…` : text;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: "#0D0A08",
            color: "#F4EDE2",
            padding: 72,
          }}
        >
          <div style={{ display: "flex", gap: 48 }}>
            {poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="" width={300} height={450} style={{ objectFit: "cover", borderRadius: 4 }} />
            )}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", flex: 1, gap: 16 }}>
              <span style={{ fontSize: 30, color: "#A8A29E" }}>
                {[review.itemType === "movie" ? "Película" : "Serie", year].filter(Boolean).join(" · ")}
              </span>
              <span style={{ fontSize: 68, lineHeight: 1.02, letterSpacing: -1.5 }}>{title}</span>
              <Stars rating={rating} />
            </div>
          </div>
          <div style={{ display: "flex", flex: 1, marginTop: 56, fontSize: 36, lineHeight: 1.4 }}>
            {excerpt ? `«${excerpt}»` : ""}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <span style={{ fontSize: 32, color: "#A8A29E" }}>Reseña de {review.user.name}</span>
            <span style={{ fontSize: 44, fontStyle: "italic", color: "#EC1B69" }}>Pixela</span>
          </div>
        </div>
      ),
      {
        width: SIZE,
        height: SIZE,
        headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400" },
      },
    );
  } catch (error) {
    return handleRouteError("Failed to render review image", error, { reviewId: id.data });
  }
}

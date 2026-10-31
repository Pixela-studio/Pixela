import { ImageResponse } from "next/og";
import { getListByShareId, toListDto } from "@/lib/api/lists";
import { tmdbImageHelpers } from "@/lib/constants/tmdb";

/**
 * Imagen para compartir una lista (WhatsApp, X, Instagram): el nombre, quién
 * la hizo y los cuatro primeros pósters, sobre el negro de sala. Nuria la
 * pedía para su cuenta de recomendaciones.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lista de Pixela";
export const revalidate = 3600;

export default async function Image({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const raw = /^[A-Za-z0-9_-]{8,24}$/.test(shareId) ? await getListByShareId(shareId) : null;
  const list = raw && raw.visibility !== "PRIVATE" ? await toListDto(raw, "cover") : null;

  const posters = (list?.items ?? [])
    .filter((item) => item.poster_path)
    .slice(0, 4)
    .map((item) => tmdbImageHelpers.poster(item.poster_path, "w342"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0D0A08",
          color: "#F4EDE2",
          padding: 64,
          gap: 48,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span style={{ fontSize: 28, color: "#A8A29E" }}>
              {list ? `Lista de ${list.owner.name}` : "Pixela"}
            </span>
            <span style={{ fontSize: 72, lineHeight: 1, letterSpacing: -2 }}>
              {list ? list.name : "Lista no disponible"}
            </span>
            {list && (
              <span style={{ fontSize: 28, color: "#A8A29E" }}>
                {list.item_count} {list.item_count === 1 ? "título" : "títulos"}
              </span>
            )}
          </div>
          <span style={{ fontSize: 40, fontStyle: "italic", color: "#EC1B69" }}>Pixela</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", width: 420, gap: 12, alignContent: "center" }}>
          {posters.map((src) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={src} src={src} alt="" width={204} height={250} style={{ objectFit: "cover", borderRadius: 4 }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}

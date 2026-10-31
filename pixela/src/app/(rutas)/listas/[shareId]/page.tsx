import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cache } from "react";
import { getListByShareId, toListDto } from "@/lib/api/lists";
import { tmdbImageHelpers } from "@/lib/constants/tmdb";
import { formatYear } from "@/lib/date";
import { ShareButton } from "@/shared/components/ShareButton";

/**
 * ISR como las fichas: la lista se genera en la primera visita y la CDN sirve
 * el resto. Cada cambio de la lista llama a `revalidatePath` sobre esta ruta,
 * así que no hace falta una vida corta.
 */
export const revalidate = 3600;
export const dynamicParams = true;
export async function generateStaticParams() {
  return [];
}

/** La misma consulta para los metadatos y para la página. */
const loadList = cache(async (shareId: string) => {
  if (!/^[A-Za-z0-9_-]{8,24}$/.test(shareId)) return null;
  const list = await getListByShareId(shareId);
  // Las privadas no existen para nadie más: ni título ni 404 distinto.
  if (!list || list.visibility === "PRIVATE") return null;
  return toListDto(list);
});

export async function generateMetadata({ params }: { params: Promise<{ shareId: string }> }): Promise<Metadata> {
  const { shareId } = await params;
  const list = await loadList(shareId);
  if (!list) return { title: "Lista no encontrada | Pixela", robots: { index: false, follow: false } };

  const title = `${list.name} · lista de ${list.owner.name} | Pixela`;
  const description =
    list.description ||
    `${list.item_count} ${list.item_count === 1 ? "título" : "títulos"}: ${list.items
      .slice(0, 4)
      .map((item) => item.title)
      .join(", ")}${list.item_count > 4 ? "…" : ""}`;

  return {
    title,
    description,
    alternates: { canonical: `/listas/${shareId}` },
    openGraph: { type: "website", url: `/listas/${shareId}`, siteName: "Pixela", locale: "es_ES", title, description },
    twitter: { card: "summary_large_image", title, description },
    // «Con enlace» = para quien tenga el enlace, no para los buscadores.
    ...(list.visibility === "LINK" ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function SharedListPage({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  const list = await loadList(shareId);
  if (!list) notFound();

  return (
    <main className="min-h-screen bg-pixela-ink px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 pt-32 pb-32 md:pt-40">
      <p className="meta-text">Lista de {list.owner.name}</p>
      <h1 className="title-card mt-3 text-[clamp(2.75rem,8vw,6rem)] [overflow-wrap:anywhere]">{list.name}</h1>
      {list.description && (
        <p className="mt-6 max-w-[65ch] text-lg leading-relaxed text-white/85">{list.description}</p>
      )}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <span className="meta-text">
          {list.item_count} {list.item_count === 1 ? "título" : "títulos"}
        </span>
        <ShareButton title={list.name} text={`«${list.name}», una lista de ${list.owner.name} en Pixela`} className="btn btn-ghost btn-sm" />
      </div>

      {list.items.length === 0 ? (
        <p className="mt-16 text-gray-400">Esta lista está vacía por ahora.</p>
      ) : (
        <ol className="mt-14 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.items.map((item, index) => (
            <li key={item.id}>
              <Link
                href={`/${item.item_type === "movie" ? "movies" : "series"}/${item.tmdb_id}`}
                prefetch={false}
                rel="nofollow"
                className="group flex flex-col"
              >
                <div className="relative mb-3 aspect-[2/3] overflow-hidden rounded-sm bg-pixela-surface">
                  {item.poster_path && (
                    <Image
                      src={tmdbImageHelpers.poster(item.poster_path, "w342")}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 45vw, 200px"
                      className="object-cover transition-transform duration-700 ease-out-expo [@media(hover:hover)]:group-hover:scale-[1.04]"
                    />
                  )}
                  <span className="absolute left-2 top-2 rounded-sm bg-black/70 px-2 py-0.5 text-sm font-semibold tabular-nums text-white">
                    {index + 1}
                  </span>
                </div>
                <span className="line-clamp-2 text-[15px] font-semibold text-white">{item.title}</span>
                <span className="mt-0.5 text-sm text-gray-400">
                  {[item.item_type === "movie" ? "Película" : "Serie", formatYear(item.release_date, "")]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
                {item.note && <span className="mt-1 text-sm italic text-white/75">«{item.note}»</span>}
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

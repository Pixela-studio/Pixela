"use client";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";
import { Badge } from "@/shared/components/Badge";
import { ActionButtons } from "@/shared/components/ActionButtons";
import { MediaInfoDetails } from "./MediaInfoDetails";
import type {
  TrendingMediaCardProps,
  PosterImageProps,
} from "@/features/trending/types";
import { tmdbImageHelpers, TMDB_PLACEHOLDER } from "@/lib/constants/tmdb";
import { isTopPixela } from "@/lib/topPixela";

/**
 * Estilos constantes para el componente TrendingMediaCard
 *
 * La tarjeta es un `<Link>` real (teclado, pulsación larga, rastreadores) y el
 * botón de favoritos va al lado, no dentro: un `<button>` dentro de un `<a>` no
 * es HTML válido. Por eso el `group` vive en el contenedor que envuelve a los dos.
 */
const STYLES = {
  card: "w-[160px] sm:w-[190px] md:w-[210px] xl:w-[230px] 2k:w-[260px] flex flex-col relative group",
  // El enlace cubre póster y pie de foto. El anillo de foco va en un `::after`
  // sobre el póster porque el carrusel recorta el outline global por arriba.
  posterLink: "block rounded-sm",
  poster:
    "relative block aspect-[2/3] w-full overflow-hidden bg-pixela-surface after:pointer-events-none after:absolute after:inset-0 after:z-30 after:content-[''] group-has-[a:focus-visible]:after:ring-2 group-has-[a:focus-visible]:after:ring-inset group-has-[a:focus-visible]:after:ring-pixela-accent",
  // Zoom lento del póster al pasar el ratón; en táctil no hay hover.
  posterImage:
    "object-cover transition-transform duration-700 ease-out-expo [@media(hover:hover)]:group-hover:scale-[1.04]",
  noiseEffect: "noise-effect",
  favorite:
    "opacity-0 transition-opacity duration-300 ease-out-expo group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100",
} as const;

const INITIALLY_VISIBLE_ITEMS = 3;

/**
 * Componente que renderiza la imagen del póster de un medio
 * @param {PosterImageProps} props - Props del componente
 * @returns {JSX.Element} Imagen del póster
 */
const PosterImage = memo(
  ({ posterPath, title, isInitiallyVisible }: PosterImageProps) => (
    <Image
      src={tmdbImageHelpers.poster(posterPath) || TMDB_PLACEHOLDER.POSTER}
      alt=""
      fill
      className={STYLES.posterImage}
      priority={isInitiallyVisible}
      sizes="(max-width: 640px) 160px, 230px"
      loading={isInitiallyVisible ? "eager" : "lazy"}
    />
  ),
);

PosterImage.displayName = "PosterImage";

/**
 * Componente que renderiza una tarjeta de medio en tendencia
 * @param {TrendingMediaCardProps} props - Props del componente
 * @returns {JSX.Element} Tarjeta de medio
 */
export const TrendingMediaCard = memo(
  ({ media, type, index = 0 }: TrendingMediaCardProps) => {
    const isInitiallyVisible = index < INITIALLY_VISIBLE_ITEMS;
    // Las series traen `name`; `title` solo lo tienen las películas.
    const title = ("name" in media && media.name) || media.title || "Sin título";

    return (
      <div className={STYLES.card}>
        <Link
          href={`/${type}/${media.id}`}
          prefetch={false}
          aria-label={title}
          className={STYLES.posterLink}
        >
          <span className={STYLES.poster}>
            <PosterImage
              posterPath={media.poster_path}
              title={title}
              isInitiallyVisible={isInitiallyVisible}
            />
            <span className={STYLES.noiseEffect} />
            {isTopPixela(media) && (
              <Badge label="Top Pixela" position="top-left" variant="primary" />
            )}
          </span>
          <MediaInfoDetails media={media} type={type} />
        </Link>

        <ActionButtons
          tmdbId={Number(media.id)}
          itemType={type === "series" ? "series" : "movie"}
          mediaTitle={title}
          className={STYLES.favorite}
        />
      </div>
    );
  },
);

TrendingMediaCard.displayName = "TrendingMediaCard";

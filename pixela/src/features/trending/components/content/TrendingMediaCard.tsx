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
  OverlayContentProps,
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
  card: "w-[280px] md:w-[375px] flex flex-col relative group",
  // El anillo de foco va en un `::after` por encima de la imagen: el carrusel
  // recorta por arriba y por abajo y los pósters van pegados, así que el
  // outline global (hacia fuera) quedaría tapado.
  posterLink:
    "relative block w-full h-[395px] md:h-[528px] overflow-hidden after:pointer-events-none after:absolute after:inset-0 after:z-30 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-pixela-accent",
  noiseEffect: "noise-effect opacity-5",
  // Al hover en ratón; siempre visible en táctil y con el foco dentro.
  overlay:
    "absolute inset-0 flex flex-col justify-end p-5 transition-opacity duration-500 ease-out-expo bg-gradient-to-t from-pixela-dark via-pixela-dark/70 to-transparent opacity-0 group-hover:opacity-100 group-hover:delay-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100",
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
      alt={title || "Media poster"}
      fill
      className="object-cover"
      priority={isInitiallyVisible}
      sizes="(max-width: 768px) 100vw, 375px"
      loading={isInitiallyVisible ? "eager" : "lazy"}
    />
  ),
);

PosterImage.displayName = "PosterImage";

/**
 * Título, nota y año superpuestos al póster
 * @param {OverlayContentProps} props - Props del componente
 * @returns {JSX.Element} Contenido superpuesto
 */
const OverlayContent = memo(({ media, type }: OverlayContentProps) => (
  <div className={STYLES.overlay}>
    <MediaInfoDetails media={media} type={type} />
  </div>
));

OverlayContent.displayName = "OverlayContent";

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
          <PosterImage
            posterPath={media.poster_path}
            title={title}
            isInitiallyVisible={isInitiallyVisible}
          />

          <div className={STYLES.noiseEffect} />

          <OverlayContent media={media} type={type} />

          {isTopPixela(media) && (
            <Badge label="TOP PIXELA" position="top-left" variant="primary" />
          )}
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

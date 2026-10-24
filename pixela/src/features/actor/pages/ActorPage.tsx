"use client";

import { ActorDetails } from "@/features/actor/services/actorService";
import { tmdbImageHelpers, DEFAULT_IMAGE_SIZES } from "@/lib/constants/tmdb";
import { MediaCarousel } from "@/shared/components/MediaCarousel";
import { BackdropImage } from "@/features/media/components/hero/backdrop/BackdropImage";
import { MediaPoster } from "@/features/media/components/hero/poster/MediaPoster";
import Link from "next/link";
import Image from "next/image";

interface ActorPageProps {
  actor: ActorDetails;
  /**
   * Claves `"movies/<id>"` / `"series/<id>"` de la filmografía que pueden
   * emitir `<Link>`, resueltas en el Server Component de la ruta.
   *
   * Este carrusel era el segundo de los dos `<Link>` que cerraban el ciclo
   * rastreable: ficha → reparto → persona → **veinte fichas nuevas** → sus
   * repartos → más personas. Sin salida, y con una entrada de caché ISR y una
   * invocación por paso, un rastreador recorría TMDB entero. Cortando aquí, el
   * grafo se cierra sobre el catálogo curado.
   *
   * Llega como lista de claves y no como allowlist entera porque la
   * intersección de los ~126 créditos de un actor con los 88 títulos curados
   * son cero o un puñado de entradas; mandar la allowlist completa habría
   * costado ~1 KB de payload RSC en cada ficha de actor.
   *
   * Opcional y con `[]` por defecto: aquí el lado seguro del fallo es no
   * enlazar, porque la garantía de grafo cerrado depende de este gate y perder
   * un enlace no rompe nada —el póster, el título y el personaje se siguen
   * viendo—. Es el criterio contrario al de `ActorCard`, donde el reparto sin
   * marcar sí enlaza; allí lo que está en juego es la navegación normal por una
   * ficha, no el cierre del ciclo.
   */
  linkableCredits?: readonly string[];
}

// Misma gramática que la ficha: el nombre en Bodoni a escala de cartel,
// alineado a la izquierda con la foto al lado.
const STYLES = {
  container: "relative min-h-[80vh] w-full bg-pixela-ink",
  contentWrapper:
    "relative w-full px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 pt-36 pb-12 md:pt-44 lg:pt-[28vh] lg:pb-20",
  layout: "flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:gap-14",
  poster: "w-32 sm:w-44 lg:w-64",
  content: "w-full min-w-0 lg:flex-grow",
  title:
    "font-display font-normal text-white text-[52px] sm:text-7xl lg:text-[104px] xl:text-[120px] leading-[0.88] tracking-[-0.04em] mb-5 [text-wrap:balance] w-full [overflow-wrap:anywhere] hyphens-auto",
  subtitle: "text-lg md:text-xl text-white/85 mb-4",
  metadata: "flex flex-wrap gap-x-5 gap-y-1 text-[15px] [font-stretch:112%] text-gray-400 mb-6",
  metadataItem: "",
  biography:
    "max-w-3xl text-base leading-relaxed text-white/80 lg:text-lg [text-wrap:pretty] line-clamp-[12]",
} as const;

/** "1956-03-07" → "7 de marzo de 1956". En UTC para que servidor y navegador coincidan. */
const formatLongDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
};

export const ActorPage = ({ actor, linkableCredits = [] }: ActorPageProps) => {
  const enlazables = new Set(linkableCredits);

  const actorImage = actor.profile_path
    ? tmdbImageHelpers.profile(actor.profile_path, DEFAULT_IMAGE_SIZES.PROFILE)
    : "";

  const credits = actor.combined_credits?.cast
    ?.filter((c) => c.poster_path)
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 20) || [];

  // Usamos la mejor película/serie del actor como Backdrop!
  const bestWorkBackdrop = credits[0]?.backdrop_path
    ? tmdbImageHelpers.backdrop(credits[0].backdrop_path, DEFAULT_IMAGE_SIZES.BACKDROP)
    : "";

  return (
    <div className="bg-pixela-ink min-h-screen">
      <div className={STYLES.container}>
        {/* BackdropImage Reutilizado (Top Hero Movie effect) */}
        {bestWorkBackdrop && <BackdropImage backdropUrl={bestWorkBackdrop} />}
        
        {/*
          Había dos árboles JSX completos, uno `lg:hidden` y otro `hidden lg:flex`,
          con dos <h1> y dos <h2> idénticos en el documento. Ya habían divergido:
          la variante móvil se quedó sin el campo "Falleció" y con un texto de
          respaldo distinto para la biografía. Un único layout responsive.
        */}
        <div className={STYLES.contentWrapper}>
          <div className={STYLES.layout}>
            <MediaPoster
              posterUrl={actorImage}
              title={actor.name}
              className={STYLES.poster}
              type="person"
            />

            <div className={STYLES.content}>
              <h1 className={STYLES.title}>{actor.name}</h1>
              <h2 className={STYLES.subtitle}>
                {actor.known_for_department || "Actuación"}
              </h2>

              <div className={STYLES.metadata}>
                {actor.birthday && (
                  <span className={STYLES.metadataItem}>Nació el {formatLongDate(actor.birthday)}</span>
                )}
                {actor.deathday && (
                  <span className={STYLES.metadataItem}>Falleció el {formatLongDate(actor.deathday)}</span>
                )}
                {actor.place_of_birth && (
                  <span className={STYLES.metadataItem}>{actor.place_of_birth}</span>
                )}
              </div>

              <p className={STYLES.biography}>
                {actor.biography ||
                  `Biografía no disponible en español para ${actor.name}.`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FILMOGRAFIA */}
      {credits.length > 0 && (
        <div className="relative z-10 pb-40 w-full px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 mt-8 mb-20">
            <h2 className="title-card text-5xl md:text-6xl mb-8">Filmografía</h2>
            <div className="relative -mx-4 sm:mx-0">
              <MediaCarousel 
                autoplay={false} 
                className="pb-4"
              >
                {credits.map((item, index) => {
                  const imageSrc = tmdbImageHelpers.poster(item.poster_path || '', DEFAULT_IMAGE_SIZES.POSTER);
                  const linkType = item.media_type === 'movie' ? 'movies' : 'series';
                  const enlazable = enlazables.has(`${linkType}/${item.id}`);

                  /*
                   * Mismo contenido con y sin enlace. La variante no enlazable
                   * se queda sin la clase `group`, así que tampoco hereda el
                   * `group-hover:scale-105` del póster ni el acento en el
                   * título: una tarjeta que reacciona al ratón y no lleva a
                   * ningún sitio es peor que una tarjeta quieta.
                   */
                  const contenido = (
                    <>
                      <div className="relative aspect-[2/3] rounded-sm overflow-hidden bg-pixela-surface mb-3">
                        <Image
                          src={imageSrc}
                          alt={item.title || item.name || ""}
                          fill
                          sizes="(max-width: 768px) 140px, 160px"
                          className="object-cover transition-transform duration-700 ease-out-expo [@media(hover:hover)]:group-hover:scale-[1.04]"
                        />
                      </div>
                      <h3 className="text-[15px] font-semibold text-white truncate">
                        {item.title || item.name}
                      </h3>
                      <p className="text-sm text-gray-400 truncate mt-0.5">
                        {item.character}
                      </p>
                    </>
                  );

                  return (
                    // `py-1`: hueco para el anillo de foco, que el overflow-hidden del carrusel recortaba.
                    <div key={`${item.id}-${index}`} className="flex-[0_0_140px] md:flex-[0_0_160px] min-w-0 pl-4 py-1 h-full">
                      {enlazable ? (
                        <Link
                          href={`/${linkType}/${item.id}`}
                          className="group h-full flex flex-col"
                          prefetch={false}
                        >
                          {contenido}
                        </Link>
                      ) : (
                        <div className="h-full flex flex-col">{contenido}</div>
                      )}
                    </div>
                  );
                })}
              </MediaCarousel>
            </div>
        </div>
      )}
    </div>
  );
};

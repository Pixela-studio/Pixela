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
}

const STYLES = {
  container: "relative min-h-[80vh] w-full bg-[#0F0F0F]",
  contentWrapper: "relative container mx-auto px-4 pt-36 pb-12 md:pt-44 lg:pt-[30vh] lg:pb-20",
  layout:
    "flex flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:gap-8 lg:text-left",
  poster: "w-40 sm:w-48 lg:w-64",
  content: "w-full lg:flex-grow",
  title: "font-outfit text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 [text-wrap:balance]",
  subtitle: "text-xl text-pixela-accent font-medium mb-6",
  metadata: "flex flex-wrap justify-center gap-3 text-sm text-gray-400 mb-6 font-medium lg:justify-start",
  metadataItem: "bg-white/5 border border-white/10 px-3 py-1 rounded-full",
  biography:
    "max-w-4xl text-base leading-relaxed text-gray-300 lg:text-lg [text-wrap:pretty]",
} as const;

export const ActorPage = ({ actor }: ActorPageProps) => {
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
    <div className="bg-[#0F0F0F] min-h-screen">
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
                  <span className={STYLES.metadataItem}>Nació: {actor.birthday}</span>
                )}
                {actor.deathday && (
                  <span className={STYLES.metadataItem}>Falleció: {actor.deathday}</span>
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
        <div className="relative z-10 pb-40 container px-4 mx-auto md:pt-0 mt-8 mb-20">
            <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Filmografía Destacada</h3>
            <div className="relative -mx-4 sm:mx-0">
              <MediaCarousel 
                autoplay={false} 
                className="pb-4"
              >
                {credits.map((item, index) => {
                  const imageSrc = tmdbImageHelpers.poster(item.poster_path || '', DEFAULT_IMAGE_SIZES.POSTER);
                  const linkType = item.media_type === 'movie' ? 'movies' : 'series';
                  return (
                    <div key={`${item.id}-${index}`} className="flex-[0_0_140px] md:flex-[0_0_160px] min-w-0 pl-4 h-full">
                      <Link 
                        href={`/${linkType}/${item.id}`}
                        className="group h-full flex flex-col"
                      >
                        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-[#1A1A1A] mb-3 shadow-lg shadow-black/50">
                          <Image
                            src={imageSrc}
                            alt={item.title || item.name || ""}
                            fill
                            sizes="(max-width: 768px) 140px, 160px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-pixela-accent transition-colors">
                          {item.title || item.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {item.character}
                        </p>
                      </Link>
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

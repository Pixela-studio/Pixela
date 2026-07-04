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
  contentWrapper: "relative container mx-auto px-4",
  mobile: {
    layout: "lg:hidden pt-36 md:pt-44 pb-8",
    innerContainer: "flex flex-col items-center gap-6",
    posterWidth: "w-48",
    content: "w-full",
    biography: "text-gray-300 text-base leading-relaxed mt-4 mb-6 text-justify"
  },
  desktop: {
    layout: "hidden lg:flex pt-[30vh] items-start pb-20", // Modified from items-end to items-start since biology can be long
    innerContainer: "flex flex-row gap-8 w-full",
    content: "flex-grow",
    biography: "text-gray-300 text-lg max-w-4xl leading-relaxed mb-8"
  },
  title: "text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-2",
  subtitle: "text-xl text-pixela-accent font-medium mb-6",
  metadata: "flex flex-wrap gap-4 text-sm text-gray-400 mb-6 font-medium",
  metadataItem: "bg-white/5 border border-white/10 px-3 py-1 rounded-full",
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
        
        <div className={STYLES.contentWrapper}>
          {/* MOBILE LAYOUT (Reutilizado de HeroSection) */}
          <div className={STYLES.mobile.layout}>
            <div className={STYLES.mobile.innerContainer}>
              <MediaPoster 
                posterUrl={actorImage} 
                title={actor.name} 
                onClick={() => {}}
                className={STYLES.mobile.posterWidth}
                type="person"
              />
              
              <div className={STYLES.mobile.content}>
                <h1 className={STYLES.title}>{actor.name}</h1>
                <h2 className={STYLES.subtitle}>{actor.known_for_department || "Actuación"}</h2>
                
                <div className={STYLES.metadata}>
                  {actor.birthday && (
                    <span className={STYLES.metadataItem}>Nació: {actor.birthday}</span>
                  )}
                  {actor.place_of_birth && (
                    <span className={STYLES.metadataItem}>{actor.place_of_birth}</span>
                  )}
                </div>

                <p className={STYLES.mobile.biography}>
                  {actor.biography || `Biografía no disponible para ${actor.name}.`}
                </p>
              </div>
            </div>
          </div>

          {/* DESKTOP LAYOUT (Reutilizado de HeroSection) */}
          <div className={STYLES.desktop.layout}>
            <div className={STYLES.desktop.innerContainer}>
              <MediaPoster 
                posterUrl={actorImage} 
                title={actor.name} 
                onClick={() => {}}
                type="person"
              />
              
              <div className={STYLES.desktop.content}>
                <h1 className={STYLES.title}>{actor.name}</h1>
                <h2 className={STYLES.subtitle}>{actor.known_for_department || "Actuación"}</h2>
                
                <div className={STYLES.metadata}>
                  {actor.birthday && (
                    <span className={STYLES.metadataItem}>Nació: {actor.birthday}</span>
                  )}
                  {actor.place_of_birth && (
                    <span className={STYLES.metadataItem}>{actor.place_of_birth}</span>
                  )}
                  {actor.deathday && (
                    <span className={STYLES.metadataItem}>Falleció: {actor.deathday}</span>
                  )}
                </div>

                <p className={STYLES.desktop.biography}>
                  {actor.biography || `Biografía no disponible en español para ${actor.name}.`}
                </p>
              </div>
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

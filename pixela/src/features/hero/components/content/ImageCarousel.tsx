"use client";

import Image from "next/image";
import clsx from "clsx";
import { useHeroStore } from "@/features/hero/store/heroStore";
import { ImageCarouselProps, HeroImage } from "@/features/hero/types/content";

const STYLES = {
  carousel: {
    base: "absolute inset-0 w-full h-full overflow-hidden",
    slot: {
      base: "absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out",
      active: "opacity-100",
      inactive: "opacity-0",
    },
  },

  image: {
    container: "relative w-full h-full lg:pt-16 animate-hero-kenburns",
    base: "w-full h-full object-cover transition-[filter] duration-700 ease-out",
    inactiveFilter: "grayscale contrast-[1.05]",
    activeFilter: "grayscale-0 saturate-[1.05]",
    mobile: "block md:hidden",
    desktop: "hidden md:block",
  },

  overlays: {
    // Radial bottom-left → transparent top-right. Text sits bottom-left,
    // so the darkest part of the frame is exactly under the copy.
    cinematicVignette:
      "absolute inset-0 [background:radial-gradient(120%_90%_at_20%_100%,rgba(15,15,15,0.92)_0%,rgba(15,15,15,0.6)_45%,transparent_75%)]",
    // Bleed the navbar area to solid dark so the fixed nav sits on a clean base.
    topFade:
      "absolute top-0 left-0 w-full h-40 sm:h-56 md:h-64 lg:h-72 bg-gradient-to-b from-pixela-dark via-pixela-dark/70 to-transparent pointer-events-none",
    // Bottom stripe so the CTA row and progress dots have contrast.
    bottomFade:
      "absolute bottom-0 left-0 w-full h-56 md:h-72 lg:h-96 bg-gradient-to-t from-pixela-dark via-pixela-dark/60 to-transparent pointer-events-none",
    // Film grain, uses the existing .noise-effect from globals.css.
    grain: "noise-effect",
  },
} as const;

const VisualOverlays = () => (
  <>
    <div className={STYLES.overlays.cinematicVignette} />
    <div className={STYLES.overlays.topFade} />
    <div className={STYLES.overlays.bottomFade} />
    <div className={STYLES.overlays.grain} />
  </>
);

const OptimizedHeroImage = ({
  image,
  index,
  isActive,
}: {
  image: HeroImage;
  index: number;
  isActive: boolean;
}) => {
  const filterClass = isActive
    ? STYLES.image.activeFilter
    : STYLES.image.inactiveFilter;

  return (
    <div className={STYLES.image.container}>
      {/* Mobile: portrait poster */}
      <div className={clsx("relative w-full h-full", STYLES.image.mobile)}>
        <Image
          src={image.poster}
          alt={image.title ?? `Hero image ${index + 1}`}
          className={clsx(STYLES.image.base, filterClass)}
          style={{ objectPosition: "center", objectFit: "cover" }}
          width={1000}
          height={1500}
          priority={index === 0}
          quality={95}
          sizes="(max-width: 768px) 100vw, 1px"
          loading={index === 0 ? "eager" : "lazy"}
        />
      </div>

      {/* Desktop: 16:9 backdrop */}
      <div className={clsx("relative w-full h-full", STYLES.image.desktop)}>
        <Image
          src={image.backdrop}
          alt={image.title ?? `Hero image ${index + 1}`}
          className={clsx(STYLES.image.base, filterClass)}
          style={{ objectPosition: "center", objectFit: "cover" }}
          width={3000}
          height={2000}
          priority={index === 0}
          quality={95}
          sizes="(min-width: 769px) 100vw, 1px"
          loading={index === 0 ? "eager" : "lazy"}
        />
      </div>
    </div>
  );
};

export const ImageCarousel = ({ images }: ImageCarouselProps) => {
  const { currentImageIndex } = useHeroStore();

  if (!images || images.length === 0) {
    return (
      <div className={STYLES.carousel.base}>
        <div
          className={clsx(
            STYLES.carousel.slot.base,
            STYLES.carousel.slot.active,
          )}
        >
          <div className="w-full h-full bg-gradient-to-br from-pixela-dark via-pixela-dark/95 to-pixela-dark" />
        </div>
        <VisualOverlays />
      </div>
    );
  }

  return (
    <div className={STYLES.carousel.base}>
      {images.map((image, index) => {
        const isActive = index === currentImageIndex;
        return (
          <div
            key={image.id ?? index}
            className={clsx(
              STYLES.carousel.slot.base,
              isActive
                ? STYLES.carousel.slot.active
                : STYLES.carousel.slot.inactive,
            )}
            aria-hidden={!isActive}
            role="tabpanel"
          >
            <OptimizedHeroImage
              image={image}
              index={index}
              isActive={isActive}
            />
          </div>
        );
      })}
      <VisualOverlays />
    </div>
  );
};

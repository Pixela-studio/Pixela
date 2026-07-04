"use client";

import Image from "next/image";
import clsx from "clsx";
import { useHeroStore } from "@/features/hero/store/heroStore";
import { ImageCarouselProps, HeroImage } from "@/features/hero/types/content";

const STYLES = {
  // Contenedor principal del carrusel
  carousel: {
    base: "absolute inset-0 w-full h-full",
    imageContainer: {
      base: "absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out",
      fadeIn: "opacity-100",
      fadeOut: "opacity-0",
    },
  },

  // Capas de superposición y efectos visuales
  overlays: {
    base: "absolute inset-0",
    darkOverlay: "bg-pixela-dark/300",
    gradientOverlay:
      "bg-gradient-to-t from-pixela-dark/90 via-pixela-dark/50 to-pixela-dark/80",
    topGradient:
      "absolute top-0 left-0 w-full h-32 sm:h-48 md:h-56 lg:h-64 bg-gradient-to-b from-pixela-dark via-pixela-dark/50 to-transparent",
    bottomGradient:
      "absolute bottom-0 left-0 w-full h-48 sm:h-64 md:h-80 lg:h-96 bg-gradient-to-t from-pixela-dark via-pixela-dark/50 to-transparent",
  },

  // Estilos de la imagen
  image: {
    container: "relative w-full h-full lg:pt-16",
    base: "w-full h-full object-cover grayscale",
    mobile: "block md:hidden", // Visible solo en móvil
    desktop: "hidden md:block", // Visible solo en escritorio
  },
} as const;

/**
 * Componente que maneja los overlays visuales del carrusel
 * Incluye gradientes y efectos de oscurecimiento
 */
const VisualOverlays = () => (
  <>
    <div className={clsx(STYLES.overlays.base, STYLES.overlays.darkOverlay)} />
    <div
      className={clsx(STYLES.overlays.base, STYLES.overlays.gradientOverlay)}
    />
    <div className={STYLES.overlays.topGradient} />
    <div className={STYLES.overlays.topGradient} />
    <div className={STYLES.overlays.bottomGradient} />
  </>
);

/**
 * Componente que renderiza una imagen optimizada para el carrusel
 * Configurado para máxima velocidad de carga como primera impresión
 * Renderiza versiones distintas para móvil (poster) y escritorio (backdrop)
 */
const OptimizedHeroImage = ({
  image,
  index,
}: {
  image: HeroImage;
  index: number;
}) => {
  return (
    <div className={STYLES.image.container}>
      {/* Versión Móvil (Poster Vertical) */}
      <div className={clsx("relative w-full h-full", STYLES.image.mobile)}>
        <Image
          src={image.poster}
          alt={`Hero poster image ${index + 1}`}
          className={STYLES.image.base}
          style={{
            objectPosition: "center",
            objectFit: "cover",
          }}
          width={1000}
          height={1500}
          priority={index === 0}
          quality={100}
          sizes="(max-width: 768px) 100vw, 1px"
          loading={index === 0 ? "eager" : "lazy"}
          unoptimized={false}
        />
      </div>

      {/* Versión Escritorio (Backdrop Horizontal) */}
      <div className={clsx("relative w-full h-full", STYLES.image.desktop)}>
        <Image
          src={image.backdrop}
          alt={`Hero backdrop image ${index + 1}`}
          className={STYLES.image.base}
          style={{
            objectPosition: "center",
            objectFit: "cover",
          }}
          width={3000}
          height={2000}
          priority={index === 0}
          quality={100}
          sizes="(min-width: 769px) 100vw, 1px"
          loading={index === 0 ? "eager" : "lazy"}
          unoptimized={false}
        />
      </div>
    </div>
  );
};

/**
 * Componente que muestra un carrusel de imágenes con efectos visuales
 * y optimizaciones de rendimiento para el hero de la página
 */
export const ImageCarousel = ({ images }: ImageCarouselProps) => {
  const { currentImageIndex } = useHeroStore();

  // En caso de que no haya imágenes, mostrar fondo mínimo
  if (!images || images.length === 0) {
    return (
      <div className={STYLES.carousel.base}>
        <div
          className={clsx(
            STYLES.carousel.imageContainer.base,
            STYLES.carousel.imageContainer.fadeIn,
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
      {images.map((image, index) => (
        <div
          key={image.id || index}
          className={clsx(
            STYLES.carousel.imageContainer.base,
            index === currentImageIndex
              ? STYLES.carousel.imageContainer.fadeIn
              : STYLES.carousel.imageContainer.fadeOut,
          )}
          aria-hidden={index !== currentImageIndex}
          role="tabpanel"
        >
          {/* 
             Renderizar solo si es la imagen actual O la anterior/siguiente (optimización),
             o renderizar todas si son pocas (mejor para transiciones suaves).
             PixelA tiene pocas imágenes en el hero, renderizamos todas pero con lazy loading
             excepto la prioritaria.
          */}
          <OptimizedHeroImage image={image} index={index} />
        </div>
      ))}
      <VisualOverlays />
    </div>
  );
};

"use client";

import { getImageProps } from "next/image";
import clsx from "clsx";
import { useHeroStore } from "@/features/hero/store/heroStore";
import { useLiteMode } from "@/hooks/useLiteMode";
import { ImageCarouselProps, HeroImage } from "@/features/hero/types/content";

const STYLES = {
  // Contenedor principal del carrusel
  carousel: {
    base: "absolute inset-0 w-full h-full",
    imageContainer: {
      // Fundido a negro: la imagen que sale se apaga deprisa y la que entra
      // espera a que la pantalla esté negra, como un corte entre planos.
      base: "absolute inset-0 w-full h-full transition-opacity ease-out-expo",
      fadeIn: "opacity-100 duration-700 delay-300",
      fadeOut: "opacity-0 duration-300",
    },
  },

  // Capas de superposición y efectos visuales
  overlays: {
    base: "absolute inset-0",
    // Antes había un darkOverlay con `bg-pixela-dark/300` — /300 no existe en
    // la escala de opacidad de Tailwind, así que esa capa nunca aplicaba.
    // Eliminada.
    // Velo para leer el texto: de izquierda a derecha en escritorio (el
    // cartón de título vive a la izquierda) y de abajo arriba en móvil.
    gradientOverlay:
      "bg-gradient-to-t from-pixela-dark/90 via-pixela-dark/40 to-pixela-dark/60 md:bg-gradient-to-r md:from-pixela-dark/95 md:via-pixela-dark/50 md:to-transparent",
    topGradient:
      "absolute top-0 left-0 w-full h-32 sm:h-40 bg-gradient-to-b from-pixela-dark/70 to-transparent",
    bottomGradient:
      "absolute bottom-0 left-0 w-full h-40 sm:h-56 md:h-72 bg-gradient-to-t from-pixela-dark to-transparent",
  },

  // Estilos de la imagen
  image: {
    container: "relative w-full h-full",
    // Concepto B&W preservado. Ligero boost de contraste para que la escala
    // de grises no se lea plana sobre el gradiente oscuro.
    // Monocromo cálido de copia antigua: escala de grises con un punto de
    // sepia, a juego con el marfil del texto.
    base: "w-full h-full object-cover grayscale contrast-[1.08] brightness-[0.85] sepia-[0.12]",
  },

  // Grano de peli sobre la imagen. Reutiliza .noise-effect (opacity 0.04)
  // ya definida en globals.css, con una máscara que lo desvanece en el
  // borde superior (bajo la barra de nav) y en el inferior (donde el hero
  // se une a Tendencias). Sin la máscara el grano llega hasta el último
  // píxel del hero mientras la sección siguiente arranca limpia, y esa
  // diferencia se lee como una línea horizontal en la unión.
  grain:
    "noise-effect [mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_82%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_12%,black_82%,transparent_100%)]",
} as const;

/**
 * Componente que maneja los overlays visuales del carrusel
 * Incluye gradientes y efectos de oscurecimiento
 */
const VisualOverlays = () => (
  <>
    <div
      className={clsx(STYLES.overlays.base, STYLES.overlays.gradientOverlay)}
    />
    <div className={STYLES.overlays.topGradient} />
    <div className={STYLES.overlays.bottomGradient} />
    <div className={STYLES.grain} />
  </>
);

/**
 * Imagen de una diapositiva: póster vertical en móvil y backdrop en escritorio.
 *
 * Es un único `<picture>` con `getImageProps`: el navegador descarga solo la
 * variante que va a mostrar. Antes eran dos `<Image>`, uno escondido con CSS,
 * y los dos llevaban `priority` en la primera diapositiva: en el móvil de
 * Tomás se precargaba también el backdrop de escritorio que nunca veía.
 */
const OptimizedHeroImage = ({
  image,
  index,
}: {
  image: HeroImage;
  index: number;
}) => {
  const isFirst = index === 0;
  const common = {
    alt: "",
    className: STYLES.image.base,
    priority: isFirst,
    sizes: "100vw",
  } as const;
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({ ...common, src: image.poster, width: 1000, height: 1500 });
  const { props: desktopProps } = getImageProps({
    ...common,
    src: image.backdrop,
    width: 3000,
    height: 2000,
  });

  return (
    <picture className={STYLES.image.container}>
      <source media="(max-width: 767px)" srcSet={mobileSrcSet ?? image.poster} />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- `alt=""` viene en las props: es decorativa, el título está en el texto del hero. */}
      <img
        {...desktopProps}
        loading={isFirst ? "eager" : "lazy"}
        style={{ objectPosition: "center", objectFit: "cover", width: "100%", height: "100%" }}
      />
    </picture>
  );
};

/**
 * Componente que muestra un carrusel de imágenes con efectos visuales
 * y optimizaciones de rendimiento para el hero de la página
 */
export const ImageCarousel = ({ images }: ImageCarouselProps) => {
  const { currentImageIndex } = useHeroStore();
  const { lite } = useLiteMode();

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

  /*
   * Solo se montan la diapositiva visible, la que sale (para el fundido) y la
   * siguiente (para que esté descargada cuando le toque). Antes se montaban
   * todas: estaban dentro del viewport, así que `loading="lazy"` no frenaba
   * nada y una visita con 3G bajaba siete u ocho imágenes a pantalla completa.
   */
  const total = images.length;
  const isMounted = (index: number) =>
    index === currentImageIndex ||
    // En modo ligero, ni la anterior ni la siguiente: una sola imagen.
    (!lite && index === (currentImageIndex + 1) % total) ||
    (!lite && index === (currentImageIndex - 1 + total) % total);

  return (
    <div className={STYLES.carousel.base}>
      {images.map((image, index) =>
        isMounted(index) ? (
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
            <OptimizedHeroImage image={image} index={index} />
          </div>
        ) : null,
      )}
      <VisualOverlays />
    </div>
  );
};

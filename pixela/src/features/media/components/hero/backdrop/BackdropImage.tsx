import Image from "next/image";
import { BackdropImageProps } from "@/features/media/types/backdrop";

const STYLES = {
  container: "absolute inset-0 overflow-hidden",
  image: "object-cover object-[center_15%]",
  // Doble degradado: vertical para fundir con la página y horizontal para que
  // el texto de la izquierda mantenga contraste sobre imágenes claras.
  overlayVertical:
    "absolute inset-0 bg-gradient-to-t from-pixela-ink via-pixela-ink/85 to-pixela-ink/30",
  overlayHorizontal:
    "absolute inset-0 bg-gradient-to-r from-pixela-ink/80 via-pixela-ink/20 to-transparent",
  fallback: "absolute inset-0 bg-gradient-to-br from-pixela-dark to-pixela-ink",
} as const;

/**
 * Fondo de la ficha.
 *
 * Se servía como `background-image` en un `style` inline, lo que dejaba fuera
 * por completo al optimizador de Next: la imagen más pesada de la página se
 * descargaba en su tamaño original, sin AVIF/WebP, sin `srcset` y sin
 * prioridad de carga. Ahora pasa por `next/image` con `priority`, porque es
 * el elemento que marca el LCP de esta pantalla.
 */
export const BackdropImage = ({ backdropUrl }: BackdropImageProps) => (
  <div className={STYLES.container} aria-hidden="true">
    {backdropUrl ? (
      <Image
        src={backdropUrl}
        alt=""
        fill
        priority
        sizes="100vw"
        className={STYLES.image}
      />
    ) : (
      <div className={STYLES.fallback} />
    )}

    <div className={STYLES.overlayVertical} />
    <div className={STYLES.overlayHorizontal} />
  </div>
);

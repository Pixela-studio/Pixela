import { useEffect, useCallback } from "react";
import { useHeroStore } from "@/features/hero/store/heroStore";
import { prefersReducedMotion } from "@/lib/motion";
import { useLiteMode } from "@/hooks/useLiteMode";

/**
 * Hook personalizado para manejar la lógica del carrusel automático
 * @param {number} imagesLength - Número total de imágenes en el carrusel
 * @returns {Function} Función para avanzar a la siguiente imagen
 */
export const useCarouselAutoPlay = (imagesLength: number) => {
  const { isPlaying, nextImage, currentImageIndex, setIsPlaying } = useHeroStore();
  const { lite } = useLiteMode();

  // Con movimiento reducido o en modo ligero el carrusel arranca en pausa: cada
  // pase descarga otra imagen a pantalla completa. El botón de reproducir
  // sigue ahí para quien quiera el pase automático.
  useEffect(() => {
    if (prefersReducedMotion() || lite) setIsPlaying(false);
  }, [setIsPlaying, lite]);

  const handleNextImage = useCallback(() => {
    nextImage(imagesLength);
  }, [nextImage, imagesLength]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && imagesLength > 0) {
      interval = setInterval(handleNextImage, 5000);
    }
    
    return () => clearInterval(interval);
  }, [isPlaying, handleNextImage, imagesLength, currentImageIndex]);

  return handleNextImage;
}; 
import { useEffect, useCallback } from "react";
import { useHeroStore } from "@/features/hero/store/heroStore";

/**
 * Hook personalizado para manejar la lógica del carrusel automático
 * @param {number} imagesLength - Número total de imágenes en el carrusel
 * @returns {Function} Función para avanzar a la siguiente imagen
 */
export const useCarouselAutoPlay = (imagesLength: number) => {
  const { isPlaying, nextImage, currentImageIndex } = useHeroStore();

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
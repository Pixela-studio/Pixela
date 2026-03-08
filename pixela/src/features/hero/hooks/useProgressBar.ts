import { useEffect } from "react";
import { useHeroStore } from "@/features/hero/store/heroStore";

/**
 * Hook personalizado para manejar la lógica de la barra de progreso
 * Actualiza el progreso cada 25ms cuando el carrusel está reproduciéndose
 */
export const useProgressBar = () => {
  const { isPlaying, currentImageIndex, setProgress, resetProgress } = useHeroStore();

  useEffect(() => {
    if (isPlaying) {
      resetProgress();
      
      const startTime = Date.now();
      const duration = 5000; // 5 segundos
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min((elapsed / duration) * 100, 100);
        setProgress(newProgress);
      }, 30); // ~33fps
      
      return () => clearInterval(progressInterval);
    }
  }, [isPlaying, currentImageIndex, setProgress, resetProgress]);
}; 
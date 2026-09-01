"use client";

import { GalleryGridProps } from '@/features/media/types/gallery';
import Image from 'next/image';
import { useState } from 'react';

// Estilos constantes del componente
const STYLES = {
  // Contenedor principal de la galería
  container: {
    base: "grid gap-4",
    backdrops: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    posters: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
  },

  // Contenedor de cada imagen
  imageContainer: {
    base: "relative overflow-hidden rounded-lg group cursor-pointer",
    aspectRatio: {
      backdrops: "aspect-video",
      posters: "aspect-[2/3]"
    }
  },

  // Estilos de la imagen
  image: {
    base: "object-cover transition-transform duration-300 group-hover:scale-105",
    error: "bg-pixela-dark/20"
  },

  // Overlay de información
  overlay: {
    base: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
    content: "absolute bottom-0 left-0 right-0 p-4 text-white"
  }
} as const;

/**
 * Componente que muestra una cuadrícula de imágenes (fondos o pósters)
 * @param {GalleryGridProps} props - Propiedades del componente
 * @returns {JSX.Element} Cuadrícula de imágenes
 */
export const GalleryGrid = ({ images, type, onImageClick, showAll = false }: GalleryGridProps) => {
  // Estado para manejar errores de carga de imágenes
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  // Determinar el número de imágenes a mostrar - Aumentamos los límites iniciales
  const displayLimit = type === 'backdrops' ? 9 : 18;
  const displayImages = showAll ? images : images.slice(0, displayLimit);

  // Manejar errores de carga de imágenes
  const handleImageError = (filePath: string) => {
    setImageErrors(prev => ({ ...prev, [filePath]: true }));
  };

  return (
    <div className={`${STYLES.container.base} ${STYLES.container[type]}`}>
      {displayImages.map((image) => (
        <div
          key={image.file_path}
          className={`${STYLES.imageContainer.base} ${STYLES.imageContainer.aspectRatio[type]}`}
          onClick={() => onImageClick(image)}
        >
          {!imageErrors[image.file_path] ? (
            <Image
              src={image.file_path}
              alt={`${type === 'backdrops' ? 'Fondo' : 'Póster'} de la película`}
              fill
              className={STYLES.image.base}
              sizes={type === 'backdrops' 
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                : "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              }
              onError={() => handleImageError(image.file_path)}
            />
          ) : (
            <div className={`w-full h-full ${STYLES.image.error}`} />
          )}
          
          <div className={STYLES.overlay.base}>
            <div className={STYLES.overlay.content}>
              <p className="text-sm">
                {image.width}x{image.height}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}; 
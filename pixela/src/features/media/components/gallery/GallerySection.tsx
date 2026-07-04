"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Wallpaper } from '@/features/media/types/gallery';
import { GallerySectionProps } from '@/features/media/types/gallery';
import { getMediaImages } from '@/features/media/services/galleryService';
import { GalleryGrid } from './GalleryGrid';
import { GalleryTabs } from './GalleryTabs';
import { useMediaStore } from '@/features/media/store/mediaStore';
import { GallerySkeleton } from '@/app/components/skeletons';


const STYLES = {
  // Contenedor principal y título
  container: "mt-12 mb-24",
  title: "text-2xl font-bold text-white mb-5",

  // Estados de carga y animaciones
  loadingContainer: "mt-12 mb-12",
  loadingSpinner: "flex justify-center py-10",
  loadingPulse: "animate-pulse flex space-x-4",
  loadingPlaceholder: "h-48 w-full bg-gray-700 rounded-lg",

  // Mensajes de error
  errorMessage: "mb-4 p-3 bg-red-900/50 text-red-200 rounded-lg",

  // Contenedor de la cuadrícula y botones
  gridContainer: "mt-6",
  buttonContainer: "flex justify-start mt-4",
  button: "px-5 py-2 rounded-lg font-semibold bg-pixela-accent hover:bg-pixela-accent/80 text-white shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pixela-accent/80 focus:ring-offset-2",

  // Estilos del modal de vista previa
  modal: {
    // Overlay del modal
    overlay: "fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4",
    // Contenedor de la imagen
    container: "relative max-w-4xl max-h-[70vh]",
    // Imagen dentro del modal
    image: "max-h-[70vh] max-w-full object-contain",
    // Botón de cierre
    closeButton: "absolute -top-10 right-0 text-white hover:text-pixela-accent",
    // Icono del botón de cierre
    closeIcon: "w-6 h-6"
  }
} as const;

/**
 * Componente que muestra la sección de galería de una película o serie
 * @param {GallerySectionProps} props - Propiedades del componente
 * @param {Media} props.media - Datos de la película o serie
 * @returns {JSX.Element} Componente de sección de galería
 */
export function GallerySection({ media }: GallerySectionProps) {
  const [images, setImages] = useState<{ backdrops: Wallpaper[], posters: Wallpaper[] }>({
    backdrops: [],
    posters: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const {
    activeGalleryTab,
    setActiveGalleryTab,
    selectedGalleryImage,
    setSelectedGalleryImage
  } = useMediaStore();

  // Renderizar el componente solo en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // No need for separate fetch, use data from props
  useEffect(() => {
    if (!isMounted) return;

    if (media.imagenes) {
         setImages({
             backdrops: media.imagenes.backdrops || [],
             posters: media.imagenes.posters || []
         });
         setIsLoading(false);
    }
  }, [media, isMounted]);

  // No renderizar nada en el servidor o antes de montar
  if (!isMounted) {
    return null;
  }

  // Si no hay imágenes y no estamos cargando, no renderizar el componente
  const hasImages = images.backdrops.length > 0 || images.posters.length > 0;
  
  if (isLoading) {
    return <GallerySkeleton count={8} />;
  }

  if (!hasImages) {
    return null;
  }

  return (
    <div className={STYLES.container}>
      <h2 className={STYLES.title}>Galería</h2>
      
      {error && (
        <div className={STYLES.errorMessage}>
          {error}
        </div>
      )}
      
      <GalleryTabs 
        activeTab={activeGalleryTab}
        onTabChange={tab => {
          setActiveGalleryTab(tab);
          setShowAll(false);
        }}
        backdropsCount={images.backdrops.length}
        postersCount={images.posters.length}
      />
      
      <div className={STYLES.gridContainer}>
        <GalleryGrid
          images={activeGalleryTab === 'backdrops' ? images.backdrops : images.posters}
          type={activeGalleryTab}
          onImageClick={(image) => setSelectedGalleryImage(image.file_path)}
          showAll={showAll}
        />
        {((activeGalleryTab === 'backdrops' && images.backdrops.length > 9) || 
          (activeGalleryTab === 'posters' && images.posters.length > 18)) && (
          <div className={STYLES.buttonContainer}>
            <button
              className={STYLES.button}
              onClick={() => setShowAll(v => !v)}
            >
              {showAll ? 'Mostrar menos' : `Mostrar todos (${images[activeGalleryTab].length})`}
            </button>
          </div>
        )}
      </div>
      
      {selectedGalleryImage && (
        <div 
          className={STYLES.modal.overlay}
          onClick={() => setSelectedGalleryImage(null)}
        >
          <div className={STYLES.modal.container} onClick={e => e.stopPropagation()}>
            <Image 
              src={selectedGalleryImage} 
              alt="Preview"
              className={STYLES.modal.image}
              width={1920}
              height={1080}
              priority
            />
            <button
              className={STYLES.modal.closeButton}
              onClick={() => setSelectedGalleryImage(null)}
            >
              <svg
                className={STYLES.modal.closeIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 
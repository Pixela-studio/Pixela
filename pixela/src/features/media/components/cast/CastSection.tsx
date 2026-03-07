"use client";

import { useCallback, useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import clsx from "clsx";
import { ActorCard } from "./ActorCard";
import { ActorSliderControls } from "./ActorSliderControls";
import { CastSectionProps } from "@/features/media/types/cast";
import { CastSkeleton } from "@/app/components/skeletons";

/**
 * Componente que muestra el reparto principal de una película o serie
 * @param {CastSectionProps} props - Propiedades del componente
 * @param {Actor[]} props.actors - Array de actores a mostrar
 * @returns {JSX.Element} Componente de sección de reparto
 */
export function CastSection({ actors }: CastSectionProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    containScroll: "trimSnaps",
  });

  /**
   * Efecto para verificar el dispositivo y establecer si es móvil o tablet
   * @returns {void}
   */
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // Móvil: < 768px
      setIsTablet(width >= 768 && width < 1024); // Tablet: 768px - 1024px
    };

    checkDevice();
    window.addEventListener("resize", checkDevice);

    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  /**
   * Efecto para manejar el carrusel de actores
   * @returns {void}
   */
  useEffect(() => {
    if (!emblaApi || (!isMobile && !isTablet && actors.length <= 6)) return;

    const onPointerDown = () => setIsDragging(true);
    const onPointerUp = () => setIsDragging(false);

    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);

    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi, isMobile, isTablet, actors.length]);

  /**
   * Función para navegar al actor anterior
   * @returns {void}
   */
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!actors) return <CastSkeleton count={6} />;
  if (actors.length === 0) return null;

  /**
   * Usar grid solo en desktop (>= 1024px) cuando hay 6 o menos actores
   * @returns {boolean}
   */
  const useGrid = !isMobile && !isTablet && actors.length <= 6;

  /**
   * Renderiza la sección de reparto
   * @returns {JSX.Element} Componente de sección de reparto
   */
  return (
    <div className="pt-8 mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="pt-4">
          <h2 className="text-2xl font-bold text-white">Reparto Principal</h2>
          <span className="inline-block px-2 py-1 mt-1 text-xs text-gray-400 rounded-full bg-pixela-dark/60">
            {actors.length} {actors.length === 1 ? "actor" : "actores"}
          </span>
        </div>

        {!useGrid && (
          <ActorSliderControls
            onPrevClick={scrollPrev}
            onNextClick={scrollNext}
          />
        )}
      </div>

      {useGrid ? (
        // Cuadrícula solo en desktop cuando hay pocos actores
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {actors.map((actor, index) => (
            <ActorCard key={`${actor.nombre}-${actor.personaje ?? ''}-${index}`} actor={actor} />
          ))}
        </div>
      ) : (
        // Slider en móvil, tablet, y desktop con muchos actores
        <div className="relative">
          <div
            className={clsx("overflow-hidden w-full cursor-grab touch-pan-y", {
              "cursor-grabbing": isDragging,
            })}
            ref={emblaRef}
          >
            <div className="flex -mx-2 will-change-transform transform-gpu">
              {actors.map((actor, index) => (
                <ActorCard
                  key={`${actor.nombre}-${actor.personaje ?? ''}-${index}`}
                  actor={actor}
                  className="flex-none w-[120px] sm:w-[140px] md:w-[160px] lg:w-[180px] mx-2"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useDiscoverStore } from "@/features/discover/store/discoverStore";
import Image from "next/image";
import { useEffect, useState, memo } from "react";
import { tmdbImageHelpers, TMDB_PLACEHOLDER } from "@/lib/constants/tmdb";

export const DiscoverBackground = () => {
  const { series, movies } = useDiscoverStore();
  const [rows, setRows] = useState<string[][]>([]);

  useEffect(() => {
    // Combinar imágenes disponibles
    const allMedia = [
      ...movies.map((m) => m.poster_path),
      ...series.map((s) => s.poster_path),
    ].filter(Boolean) as string[];

    if (allMedia.length > 0) {
      // Función para obtener un set aleatorio de imágenes
      const getRandomSet = () => {
        // Copiamos y mezclamos el array completo
        const shuffled = [...allMedia].sort(() => 0.5 - Math.random());
        // Devolvemos los primeros 15 para asegurar variedad en cada fila
        return shuffled.slice(0, 15);
      };

      // Generamos 4 filas independientes
      setRows([getRandomSet(), getRandomSet(), getRandomSet(), getRandomSet()]);
    }
  }, [series, movies]);

  if (rows.length === 0) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none">
      {/* 
         Contenedor transformado para cubrir toda la pantalla.
         - Añadimos mask-image para desvanecer los bordes y evitar cortes duros.
      */}
      <div
        className="flex flex-col gap-6 transform -rotate-3 scale-[1.3] -translate-y-32 -translate-x-20 w-[150%] h-[150%] origin-center"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 10%, black 90%, transparent), linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in", // Para compatibilidad
        }}
      >
        {/* Fila 1 */}
        <MarqueeRow images={rows[0]} direction="normal" speed="slow" />

        {/* Fila 2 */}
        <MarqueeRow images={rows[1]} direction="reverse" speed="normal" />

        {/* Fila 3 */}
        <MarqueeRow images={rows[2]} direction="normal" speed="slow" />

        {/* Fila 4 */}
        <MarqueeRow images={rows[3]} direction="reverse" speed="normal" />
      </div>

      {/* Overlay Radial (Vignette) para centrar la atención y mejorar legibilidad en bordes */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at center, transparent 30%, #000000 100%)",
        }}
      />

      {/* Overlays Lineales para asegurar la transición suave en los bordes extremos */}
      <div className="absolute inset-0 bg-gradient-to-b from-pixela-dark via-transparent to-pixela-dark pointer-events-none z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-pixela-dark/80 via-transparent to-pixela-dark/80 pointer-events-none z-10" />
    </div>
  );
};

const MarqueeRow = memo(
  ({
    images,
    direction,
    speed,
  }: {
    images: string[];
    direction: "normal" | "reverse";
    speed: "normal" | "slow";
  }) => {
    const animationClass =
      direction === "normal" ? "animate-marquee" : "animate-marquee-reverse";

    const durationStyle = {
      animationDuration: speed === "slow" ? "150s" : "120s",
    };

    return (
      <div className="flex relative overflow-hidden w-full">
        {/* 
         Estrategia "Doble Render" para Marquee Infinito perfecto:
         Renderizamos dos copias del contenido. Ambas se animan simultáneamente.
         Cuando la primera termina (llega a -100%), la segunda ya ha ocupado su lugar (estaba en 0%).
         El loop es imperceptible porque son idénticas.
      */}
        <div className="flex min-w-full flex-shrink-0 items-center justify-start gap-4">
          <MarqueeContent
            images={images}
            animationClass={animationClass}
            durationStyle={durationStyle}
          />
          <MarqueeContent
            images={images}
            animationClass={animationClass}
            durationStyle={durationStyle}
            ariaHidden={true}
          />
        </div>
      </div>
    );
  },
);

MarqueeRow.displayName = "MarqueeRow";

const MarqueeContent = memo(
  ({
    images,
    animationClass,
    durationStyle,
    ariaHidden,
  }: {
    images: string[];
    animationClass: string;
    durationStyle: React.CSSProperties;
    ariaHidden?: boolean;
  }) => (
    <div
      className={`flex gap-4 min-w-max flex-shrink-0 items-center ${animationClass} flex-nowrap`}
      style={durationStyle}
      aria-hidden={ariaHidden}
    >
      {images.map((src, idx) => (
        <div
          key={`${src}-${idx}`}
          className="relative w-[200px] h-[300px] flex-shrink-0 rounded-lg overflow-hidden shadow-2xl transition duration-500"
        >
          <Image
            src={tmdbImageHelpers.poster(src) || TMDB_PLACEHOLDER.POSTER}
            alt="Background poster"
            fill
            className="object-cover"
            sizes="200px"
            unoptimized
          />
        </div>
      ))}
    </div>
  ),
);

MarqueeContent.displayName = "MarqueeContent";

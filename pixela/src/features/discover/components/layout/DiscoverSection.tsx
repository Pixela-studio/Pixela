"use client";

import { useEffect } from "react";
import { useDiscoverStore } from "@/features/discover/store/discoverStore";
import { TrendingSerie, TrendingMovie } from "@/features/discover/types/media";
import { DiscoverContent } from "@/features/discover/components/core/DiscoverContent";

interface DiscoverSectionProps {
  series: TrendingSerie[];
  movies: TrendingMovie[];
  heading: string[];
}

/**
 * Componente principal de la sección de descubrimiento.
 * Inicializa el store con los datos del servidor y pasa el heading (elegido
 * server-side para evitar flash de hidratación) al contenido.
 */
export const DiscoverSection = ({
  series,
  movies,
  heading,
}: DiscoverSectionProps) => {
  const { setSeries, setMovies } = useDiscoverStore();

  useEffect(() => {
    if (series?.length) setSeries(series);
    if (movies?.length) setMovies(movies);
  }, [series, movies, setSeries, setMovies]);

  return <DiscoverContent heading={heading} />;
};

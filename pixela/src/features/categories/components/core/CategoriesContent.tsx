"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Pelicula, Serie } from "@/features/media/types/content";
import { Badge } from "@/shared/components/Badge";
import { ActionButtons } from "@/shared/components/ActionButtons";
import { useState, memo, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { FiSearch, FiX, FiRefreshCw, FiFilm, FiTv, FiAlertCircle } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { ContentSkeleton } from "@/app/components/skeletons";
import { ItemCounter } from "@/features/categories/components/ui/ItemCounter";
import { CategoriesContentProps } from "@/features/categories/types/content";
import { tmdbImageHelpers } from "@/lib/constants/tmdb";
import { isTopPixela } from "@/lib/topPixela";

const INITIAL_VISIBLE_ITEMS = 6;
const BATCH_SIZE = 12;

interface SearchFormData {
  searchTerm: string;
}

const STYLES = {
  // Layout y Contenedores Principales
  mainContainer: "space-y-8 pb-24",
  contentWrapper: "transform-gpu",
  contentGrid:
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6",

  // Estados (Vacío y Error)
  emptyState: "text-center text-gray-400 py-12",
  errorState: "text-center text-red-500 py-12",

  // Barra de Búsqueda
  searchContainer: "relative mb-8",
  searchIcon:
    "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none",
  searchInput:
    "w-full h-12 pl-11 pr-11 bg-pixela-surface border border-white/10 rounded-full text-white placeholder:text-white/40 hover:border-white/20 focus:border-pixela-accent/60 transition-colors duration-200",
  clearButton:
    "absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-white/50 hover:text-white transition-colors duration-200",
  searchIconInner: "h-5 w-5 text-white/50",

  // Categorías en Móvil

  // Tarjeta de Contenido (Película/Serie) - Con efecto de borde interactivo.
  // El `group` va en el contenedor que envuelve al enlace y al botón de
  // favoritos (hermanos: un <button> no puede ir dentro de un <a>), para que
  // pasar por encima del botón no apague el hover de la tarjeta.
  cardWrapper: "relative group w-full",
  // Mismo póster que las filas de la home: 2:3, esquinas casi rectas y el
  // pie de foto debajo, siempre visible. Fuera el borde que seguía al ratón.
  card: "w-full flex flex-col relative rounded-sm",
  cardContent: "relative",
  posterContainer:
    "relative w-full aspect-[2/3] overflow-hidden rounded-sm bg-pixela-surface after:pointer-events-none after:absolute after:inset-0 after:z-30 after:content-[''] group-has-[a:focus-visible]:after:ring-2 group-has-[a:focus-visible]:after:ring-inset group-has-[a:focus-visible]:after:ring-pixela-accent",
  poster:
    "object-cover transition-transform duration-700 ease-out-expo [@media(hover:hover)]:group-hover:scale-[1.04]",
  noiseEffect: "noise-effect",
  overlay: "pt-3",
  // Favoritos: al hover en ratón; siempre visible en táctil y con el foco dentro.
  favorite:
    "opacity-0 transition-opacity duration-300 ease-out-expo group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100",
  overlayContent: "",
  title: "text-[15px] md:text-base font-semibold leading-snug text-white line-clamp-2",
  mediaInfo: "mt-1 flex items-center gap-3 flex-wrap text-sm text-gray-400 tabular-nums",
  rating: "flex items-center text-white/85",
  ratingIcon: "mr-1 text-[11px]",
  ratingText: "",
  year: "",
  mediaType: "",

  // Placeholder para Tarjetas sin Imagen
  placeholderContainer:
    "absolute inset-0 bg-gradient-to-br from-pixela-raised via-pixela-surface to-black flex flex-col items-center justify-center p-4 text-center",
  placeholderEmoji: "text-4xl mb-3 opacity-50",
  placeholderTitle:
    "text-white text-sm font-medium leading-tight mb-2 line-clamp-3",
  placeholderNoImage: "text-xs text-gray-400 opacity-75",
  placeholderOverlay:
    "absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none",

  // Sección de Recomendación Aleatoria
  randomContainer: "container px-4 mx-auto",
  randomGrid:
    "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[70vh]",
  textContainer: "max-w-2xl space-y-8 lg:ml-12",
  textContent: "space-y-6",
  mainTitle: "title-card text-5xl sm:text-6xl lg:text-7xl [text-wrap:balance]",
  descriptionContainer:
    "space-y-4 text-base leading-relaxed md:space-y-6 md:text-lg lg:text-xl text-pixela-light/80",
  descriptionText: "text-balance",

  // Contenedor de Tarjetas Aleatorias y Botón
  cardsContainer: "flex justify-center w-full",
  cardsWrapper: "relative w-full max-w-lg text-center",
  randomButton: "btn btn-primary w-full max-w-lg mb-6",
  buttonIcon:
    "w-5 h-5 transition-transform duration-500 group-hover:rotate-180",
  buttonText: "font-medium",

  // Tarjetas (Misteriosa y Recomendación)
  cardsGrid: "grid grid-cols-1 sm:grid-cols-2 gap-6",
  mysteryCard:
    "w-full aspect-[2/3] rounded-sm bg-pixela-surface flex flex-col items-center justify-center p-6",
  mysteryEmoji: "h-10 w-10 mb-4 text-white/40",
  mysteryTitle: "text-white/80 text-sm font-medium mb-2",
  mysteryDescription: "text-gray-400 text-sm text-center",
  recommendationOverlay: "pt-3 text-left",
  recommendationTitle: "text-base md:text-lg font-semibold leading-snug text-white line-clamp-2",
  recommendationInfo: "mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-400 tabular-nums",
  recommendationRating: "flex items-center text-white/85",
  recommendationRatingIcon: "mr-1 text-[11px]",
  recommendationRatingText: "",
  recommendationYear: "",
  recommendationMediaType: "",
} as const;

/**
 * Componente placeholder cuando no hay imagen disponible
 */
const PlaceholderPoster = memo(
  ({ title, type }: { title: string; type: "movies" | "series" }) => {
    return (
      <div className={STYLES.placeholderContainer}>
        <div className={STYLES.placeholderEmoji}>
          {type === "movies" ? <FiFilm aria-hidden="true" /> : <FiTv aria-hidden="true" />}
        </div>
        <h3 className={STYLES.placeholderTitle}>{title}</h3>
        <div className={STYLES.placeholderNoImage}>Sin imagen disponible</div>
        <div className={STYLES.placeholderOverlay} />
      </div>
    );
  },
);

PlaceholderPoster.displayName = "PlaceholderPoster";

/**
 * Componente que muestra la imagen de la película o serie.
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {string} props.posterPath - URL de la imagen de la película o serie
 * @param {string} props.title - Título de la película o serie
 * @param {boolean} props.isInitiallyVisible - Indica si la imagen se debe cargar inicialmente
 * @param {'movies' | 'series'} props.type - Tipo de contenido
 */
const PosterImage = memo(
  ({
    posterPath,
    title,
    isInitiallyVisible,
    type,
  }: {
    posterPath: string;
    title: string;
    isInitiallyVisible: boolean;
    type: "movies" | "series";
  }) => {
    const [imageError, setImageError] = useState(false);

    // Si no hay posterPath o hubo error, mostrar placeholder
    if (!posterPath || posterPath.trim() === "" || imageError) {
      return <PlaceholderPoster title={title} type={type} />;
    }

    return (
      <Image
        src={tmdbImageHelpers.poster(posterPath)}
        alt=""
        fill
        className={STYLES.poster}
        priority={isInitiallyVisible}
        sizes="(max-width: 768px) 100vw, 375px"
        loading={isInitiallyVisible ? "eager" : "lazy"}
        quality={90}
        placeholder="blur"
        onError={() => setImageError(true)}
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPj4+Oj4+Oj4+Oj4+Oj4+Oj4+Oj4+Oj7/2wBDAR4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
    );
  },
);

PosterImage.displayName = "PosterImage";

/**
 * Componente que renderiza el contenido superpuesto al hacer hover
 * @param {Object} props - Propiedades del componente
 * @param {Pelicula | Serie} props.media - Película o serie
 * @param {'series' | 'movies'} props.type - Tipo de medio
 */
const OverlayContent = ({
  media,
  type,
}: {
  media: Pelicula | Serie;
  type: "series" | "movies";
}) => {
  // Obtener el título según el tipo de media
  const title =
    type === "movies"
      ? (media as Pelicula).title || (media as Pelicula).titulo || "Sin título"
      : (media as Serie).name ||
        (media as Serie).titulo ||
        (media as Serie).title ||
        "Sin título";

  // Obtener el año de lanzamiento
  const releaseYear =
    type === "movies"
      ? (media as Pelicula).release_date?.split("-")[0]
      : (media as Serie).first_air_date?.split("-")[0];

  return (
    <div className={STYLES.overlay}>
      <div className={STYLES.overlayContent}>
        <h3 className={STYLES.title}>{title}</h3>

        <div className={STYLES.mediaInfo}>
          <div className={STYLES.rating}>
            <FaStar className={STYLES.ratingIcon} />
            <span className={STYLES.ratingText}>
              {media.vote_average ? media.vote_average.toFixed(1).replace(".", ",") : "Sin nota"}
            </span>
          </div>

          {releaseYear && <span className={STYLES.year}>{releaseYear}</span>}

          <span className={STYLES.mediaType}>
            {type === "series" ? "Serie" : "Película"}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Componente que muestra la tarjeta de la película o serie.
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {Pelicula | Serie} props.media - Película o serie
 * @param {'series' | 'movies'} props.type - Tipo de media
 * @param {number} props.index - Índice de la película o serie
 * @returns {JSX.Element} La tarjeta renderizada
 */
const MediaCard = memo(
  ({
    media,
    type,
    index,
  }: {
    media: Pelicula | Serie;
    type: "series" | "movies";
    index: number;
  }) => {
    const isInitiallyVisible = index < INITIAL_VISIBLE_ITEMS;

    const title =
      type === "movies"
        ? (media as Pelicula).title || (media as Pelicula).titulo || "Sin título"
        : (media as Serie).name ||
          (media as Serie).titulo ||
          (media as Serie).title ||
          "Sin título";

    return (
      // `motion-reduce:` como red: si la animación no corre, la tarjeta no
      // puede quedarse en `opacity-0`. El `!` hace falta porque
      // `.animate-fade-in-up` se declara en globals.css después de las utilidades.
      <div
        className={`${STYLES.cardWrapper} opacity-0 animate-fade-in-up motion-reduce:opacity-100 motion-reduce:!animate-none`}
        style={{
          animationDelay: `${Math.min(index * 40, 400)}ms`,
          animationDuration: "0.5s",
          animationFillMode: "forwards",
        }}
      >
        <Link
          href={`/${type}/${media.id}`}
          prefetch={false}
          aria-label={title}
          className={STYLES.card}
        >
          <div className={STYLES.cardContent}>
            <div className={STYLES.posterContainer}>
              <PosterImage
                posterPath={media.poster_path || media.poster || ""}
                title={title}
                isInitiallyVisible={isInitiallyVisible}
                type={type}
              />

              <div className={STYLES.noiseEffect} />

              {isTopPixela(media) && (
                <Badge label="Top Pixela" position="top-left" variant="primary" />
              )}
            </div>
            <OverlayContent media={media} type={type} />
          </div>
        </Link>

        <ActionButtons
          tmdbId={Number(media.id)}
          itemType={type === "series" ? "series" : "movie"}
          mediaTitle={title}
          className={STYLES.favorite}
        />
      </div>
    );
  },
);

MediaCard.displayName = "MediaCard";

/**
 * Hook para filtrar y ordenar el contenido de películas y series.
 *
 * @param {Pelicula[]} movies - Array de películas
 * @param {Serie[]} series - Array de series
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Pelicula[] | Serie[]} Array de películas o series filtrado y ordenado
 */
const useFilteredContent = (
  movies: Pelicula[],
  series: Serie[],
  searchTerm: string,
) => {
  return useMemo(() => {
    const movieContent = movies.map((movie) => ({
      ...movie,
      mediaType: "movie" as const,
    }));
    const seriesContent = series.map((serie) => ({
      ...serie,
      mediaType: "series" as const,
    }));

    return [...movieContent, ...seriesContent]
      .filter((item) => {
        if (searchTerm === "") return true;

        const searchField =
          item.mediaType === "movie"
            ? (item as Pelicula).title || (item as Pelicula).titulo
            : (item as Serie).name ||
              (item as Serie).titulo ||
              (item as Serie).title;

        return (
          searchField?.toLowerCase().includes(searchTerm.toLowerCase()) || false
        );
      })
      .sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  }, [movies, series, searchTerm]);
};

/**
 * Componente que muestra el contenido de películas y series.
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {Pelicula[]} props.movies - Array de películas
 * @param {Serie[]} props.series - Array de series
 * @param {string} props.searchTerm - Término de búsqueda
 * @returns {JSX.Element} El contenido renderizado
 */
const ContentGrid = memo(
  ({
    movies,
    series,
    searchTerm,
  }: {
    movies: Pelicula[];
    series: Serie[];
    searchTerm: string;
  }) => {
    const [visibleItems, setVisibleItems] = useState(BATCH_SIZE);
    const filteredContent = useFilteredContent(movies, series, searchTerm);
    const hasMore = visibleItems < filteredContent.length;

    useEffect(() => {
      const handleScroll = () => {
        if (
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 1000
        ) {
          setVisibleItems((prev) =>
            Math.min(prev + BATCH_SIZE, filteredContent.length),
          );
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [filteredContent.length]);

    return (
      <div className={STYLES.contentGrid}>
        {filteredContent.slice(0, visibleItems).map((item, index) => (
          <MediaCard
            key={`${item.id}-${item.mediaType}`}
            media={item}
            type={item.mediaType === "movie" ? "movies" : "series"}
            index={index}
          />
        ))}
        {hasMore && <div className="h-8" />}
      </div>
    );
  },
);

ContentGrid.displayName = "ContentGrid";

/**
 * Hook para obtener recomendaciones aleatorias separadas (una película y una serie).
 *
 * @param {Pelicula[]} movies - Array de películas
 * @param {Serie[]} series - Array de series
 * @returns {Object} Objeto con las recomendaciones actuales y función para obtener nuevas
 */
const useRandomRecommendations = (
  movies: Pelicula[],
  series: Serie[],
  mediaType: string,
) => {
  const [currentMovie, setCurrentMovie] = useState<
    (Pelicula & { mediaType: "movie" }) | null
  >(null);
  const [currentSerie, setCurrentSerie] = useState<
    (Serie & { mediaType: "series" }) | null
  >(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastMediaType, setLastMediaType] = useState<string>(mediaType);

  const getNewRecommendations = useCallback(() => {
    // Prevenir múltiples ejecuciones simultáneas
    if (isGenerating) return;

    // Verificar que hay contenido disponible
    if (movies.length === 0 && series.length === 0) return;

    setIsGenerating(true);

    // Resetear recomendaciones actuales
    setCurrentMovie(null);
    setCurrentSerie(null);

    // Pequeño delay para evitar condiciones de carrera
    setTimeout(() => {
      // Seleccionar película aleatoria
      if (movies.length > 0) {
        const randomMovieIndex = Math.floor(Math.random() * movies.length);
        setCurrentMovie({
          ...movies[randomMovieIndex],
          mediaType: "movie" as const,
        });
      }

      // Seleccionar serie aleatoria
      if (series.length > 0) {
        const randomSerieIndex = Math.floor(Math.random() * series.length);
        setCurrentSerie({
          ...series[randomSerieIndex],
          mediaType: "series" as const,
        });
      }

      setHasSearched(true);
      setIsGenerating(false);
    }, 150);
  }, [movies, series, isGenerating]);

  // Resetear estado cuando no hay contenido
  useEffect(() => {
    if (movies.length === 0 && series.length === 0) {
      setCurrentMovie(null);
      setCurrentSerie(null);
      setHasSearched(false);
      setIsGenerating(false);
    }
  }, [movies.length, series.length]);

  // Resetear estado solo cuando se cambia entre random y no-random
  useEffect(() => {
    if (mediaType !== lastMediaType) {
      if (mediaType === "random" || lastMediaType === "random") {
        setCurrentMovie(null);
        setCurrentSerie(null);
        setHasSearched(false);
        setIsGenerating(false);
      }
      setLastMediaType(mediaType);
    }
  }, [mediaType, lastMediaType]);

  return {
    currentMovie,
    currentSerie,
    hasSearched,
    getNewRecommendations,
    isGenerating,
  };
};

/**
 * Componente que muestra una card de recomendación individual.
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {(Pelicula | Serie) & { mediaType: 'movie' | 'series' }} props.recommendation - Recomendación a mostrar
 * @returns {JSX.Element} Card de recomendación
 */
const RecommendationCard = memo(
  ({
    recommendation,
  }: {
    recommendation: (Pelicula | Serie) & { mediaType: "movie" | "series" };
  }) => {

    const title =
      recommendation.mediaType === "movie"
        ? (recommendation as Pelicula).title ||
          (recommendation as Pelicula).titulo ||
          "Sin título"
        : (recommendation as Serie).name ||
          (recommendation as Serie).titulo ||
          (recommendation as Serie).title ||
          "Sin título";

    // Obtener el año de lanzamiento
    const releaseYear =
      recommendation.mediaType === "movie"
        ? (recommendation as Pelicula).release_date?.split("-")[0]
        : (recommendation as Serie).first_air_date?.split("-")[0];

    return (
      <div
        className={`${STYLES.cardWrapper} animate-fade-in motion-reduce:!animate-none`}
      >
        <Link
          href={`/${recommendation.mediaType === "series" ? "series" : "movies"}/${recommendation.id}`}
          prefetch={false}
          aria-label={title}
          className={STYLES.card}
        >
          <div className={STYLES.cardContent}>
            <div className={STYLES.posterContainer}>
              <PosterImage
                posterPath={
                  recommendation.poster_path || recommendation.poster || ""
                }
                title={title}
                isInitiallyVisible={true}
                type={recommendation.mediaType === "movie" ? "movies" : "series"}
              />

              <div className={STYLES.noiseEffect} />

              {isTopPixela(recommendation) && (
                <Badge label="Top Pixela" position="top-left" variant="primary" />
              )}
            </div>
            <div className={STYLES.recommendationOverlay}>
              <div className="mb-2 md:mb-3">
                <h3 className={STYLES.recommendationTitle}>{title}</h3>

                <div className={STYLES.recommendationInfo}>
                  <div className={STYLES.recommendationRating}>
                    <FaStar className={STYLES.recommendationRatingIcon} />
                    <span className={STYLES.recommendationRatingText}>
                      {recommendation.vote_average ? recommendation.vote_average.toFixed(1).replace(".", ",") : "Sin nota"}
                    </span>
                  </div>

                  {releaseYear && (
                    <span className={STYLES.recommendationYear}>
                      {releaseYear}
                    </span>
                  )}

                  <span className={STYLES.recommendationMediaType}>
                    {recommendation.mediaType === "series"
                      ? "Serie"
                      : "Película"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <ActionButtons
          tmdbId={Number(recommendation.id)}
          itemType={recommendation.mediaType === "series" ? "series" : "movie"}
          mediaTitle={title}
          className={STYLES.favorite}
        />
      </div>
    );
  },
);

RecommendationCard.displayName = "RecommendationCard";

/**
 * Componente que muestra dos recomendaciones aleatorias (una película y una serie).
 *
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {Pelicula[]} props.movies - Array de películas
 * @param {Serie[]} props.series - Array de series
 * @returns {JSX.Element} Las dos recomendaciones renderizadas
 */
const RandomRecommendations = memo(
  ({
    movies,
    series,
    mediaType,
  }: {
    movies: Pelicula[];
    series: Serie[];
    mediaType: string;
  }) => {
    const {
      currentMovie,
      currentSerie,
      hasSearched,
      getNewRecommendations,
      isGenerating,
    } = useRandomRecommendations(movies, series, mediaType);

    const handleNewRecommendations = () => {
      if (!isGenerating && (movies.length > 0 || series.length > 0)) {
        getNewRecommendations();
      }
    };

    // Verificar si hay contenido disponible para generar recomendaciones
    const hasContentAvailable = movies.length > 0 || series.length > 0;

    return (
      <div className={STYLES.randomContainer}>
        <div className={STYLES.randomGrid}>
          {/* Texto descriptivo a la izquierda */}
          <div className={STYLES.textContainer}>
            <div className={STYLES.textContent}>
              <h2 className={STYLES.mainTitle}>
                ¿No sabes qué ver ahora mismo?
              </h2>

              <div className={STYLES.descriptionContainer}>
                <p className={STYLES.descriptionText}>
                  Pulsa «Sorpréndeme» y te enseñamos una película y una serie al
                  azar del catálogo. Si no te convencen, pide otras.
                </p>
              </div>
            </div>

          </div>

          {/* Cards de recomendación a la derecha */}
          <div className={STYLES.cardsContainer}>
            <div className={STYLES.cardsWrapper}>
              <button
                onClick={handleNewRecommendations}
                disabled={isGenerating || !hasContentAvailable}
                className={`${STYLES.randomButton} ${isGenerating || !hasContentAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <FiRefreshCw
                  className={`${STYLES.buttonIcon} ${isGenerating ? "animate-spin" : ""}`}
                />
                <span className={STYLES.buttonText}>
                  {!hasContentAvailable
                    ? "Cargando contenido..."
                    : isGenerating
                      ? "Generando..."
                      : hasSearched
                        ? "Nuevas recomendaciones"
                        : "Sorpréndeme"}
                </span>
              </button>

              {!hasSearched ? (
                <div className={STYLES.cardsGrid}>
                  {[
                    { type: "Película", Icon: FiFilm },
                    { type: "Serie", Icon: FiTv },
                  ].map(({ type, Icon }) => (
                    <div key={type} className={STYLES.mysteryCard}>
                      <Icon className={STYLES.mysteryEmoji} aria-hidden="true" />
                      <h3 className={STYLES.mysteryTitle}>{type} misteriosa</h3>
                      <p className={STYLES.mysteryDescription}>
                        Haz clic en &quot;Sorpréndeme&quot; para descubrirla
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={STYLES.cardsGrid}>
                  {/* Tarjeta de película */}
                  {currentMovie ? (
                    <RecommendationCard recommendation={currentMovie} />
                  ) : movies.length > 0 ? (
                    <div className={STYLES.mysteryCard}>
                      <FiFilm className={STYLES.mysteryEmoji} aria-hidden="true" />
                      <h3 className={STYLES.mysteryTitle}>
                        Cargando película...
                      </h3>
                      <p className={STYLES.mysteryDescription}>
                        Seleccionando una película aleatoria
                      </p>
                    </div>
                  ) : (
                    <div className={STYLES.mysteryCard}>
                      <FiAlertCircle className={STYLES.mysteryEmoji} aria-hidden="true" />
                      <h3 className={STYLES.mysteryTitle}>Sin películas</h3>
                      <p className={STYLES.mysteryDescription}>
                        No hay películas disponibles
                      </p>
                    </div>
                  )}

                  {/* Tarjeta de serie */}
                  {currentSerie ? (
                    <RecommendationCard recommendation={currentSerie} />
                  ) : series.length > 0 ? (
                    <div className={STYLES.mysteryCard}>
                      <FiTv className={STYLES.mysteryEmoji} aria-hidden="true" />
                      <h3 className={STYLES.mysteryTitle}>Cargando serie...</h3>
                      <p className={STYLES.mysteryDescription}>
                        Seleccionando una serie aleatoria
                      </p>
                    </div>
                  ) : (
                    <div className={STYLES.mysteryCard}>
                      <FiAlertCircle className={STYLES.mysteryEmoji} aria-hidden="true" />
                      <h3 className={STYLES.mysteryTitle}>Sin series</h3>
                      <p className={STYLES.mysteryDescription}>
                        No hay series disponibles
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

RandomRecommendations.displayName = "RandomRecommendations";

/**
 * Componente que muestra el contenido de películas y series.
 *
 * @component
 * @param {CategoriesContentProps} props - Propiedades del componente
 * @returns {JSX.Element} El contenido renderizado
 */
const CategoriesContent = memo(
  ({
    selectedCategory,
    movies,
    series,
    loading,
    error,
    searchQuery,
    onSearch,
    mediaType,
    currentPage,
    totalPages,
  }: CategoriesContentProps) => {
    const {
      register,
      handleSubmit,
      reset,
      watch,
      formState: { errors },
    } = useForm<SearchFormData>({
      defaultValues: { searchTerm: searchQuery || "" },
    });
    const currentSearchValue = watch("searchTerm");

    // Sincronizar el formulario con la prop searchQuery externa solo si cambia externamente
    useEffect(() => {
      if (searchQuery && searchQuery !== currentSearchValue) {
        reset({ searchTerm: searchQuery });
      }
    }, [searchQuery, reset]); // Removed currentSearchValue from dependency to avoid loop

    // Búsqueda en tiempo real con debounce
    useEffect(() => {
      const timer = setTimeout(() => {
        if (
          currentSearchValue !== undefined &&
          currentSearchValue !== searchQuery
        ) {
          onSearch(currentSearchValue);
        }
      }, 500);

      return () => clearTimeout(timer);
    }, [currentSearchValue, onSearch, searchQuery]);

    const onFormSubmit = (data: SearchFormData) => {
      // Evitar doble búsqueda si ya se disparó por debounce
      if (data.searchTerm !== searchQuery) {
        onSearch(data.searchTerm);
      }
    };

    const handleClearSearch = () => {
      reset({ searchTerm: "" });
      onSearch("");
    };

    const getSearchPlaceholder = () => {
      switch (mediaType) {
        case "movies":
          return "Buscar películas...";
        case "series":
          return "Buscar series...";
        default:
          return "Buscar películas o series...";
      }
    };

    const hasContent = movies.length > 0 || series.length > 0;

    if (error) {
      return <div className={STYLES.errorState}>{error}</div>;
    }

    return (
      <div className={`${STYLES.mainContainer}`}>
        {mediaType !== "random" && (
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            className={STYLES.searchContainer}
          >
            <div className={STYLES.searchIcon}>
              <FiSearch className={STYLES.searchIconInner} />
            </div>
            <input
              type="text"
              {...register("searchTerm", {
                minLength: {
                  value: 2,
                  message: "La búsqueda debe tener al menos 2 caracteres",
                },
              })}
              placeholder={getSearchPlaceholder()}
              className={STYLES.searchInput}
            />
            {currentSearchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className={STYLES.clearButton}
                aria-label="Limpiar búsqueda"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
            {errors.searchTerm && (
              <p className="mt-2 ml-2 text-xs text-red-500">
                {errors.searchTerm.message}
              </p>
            )}
          </form>
        )}

        {mediaType !== "random" && loading ? (
          <div className="relative">
            <ContentSkeleton />
          </div>
        ) : !hasContent && mediaType !== "random" ? (
          <div className={STYLES.emptyState}>
            {selectedCategory
              ? `No se encontró contenido en la categoría ${selectedCategory.name}`
              : "No se encontró contenido"}
          </div>
        ) : (
          <>
            {mediaType !== "random" && hasContent && (
              <ItemCounter
                moviesCount={movies.length}
                seriesCount={series.length}
                currentPage={currentPage}
                totalPages={totalPages}
                isSearching={!!searchQuery.trim()}
                searchQuery={searchQuery}
                mediaType={mediaType}
              />
            )}
            <div className={STYLES.contentWrapper}>
              {mediaType === "random" ? (
                <RandomRecommendations
                  movies={movies}
                  series={series}
                  mediaType={mediaType}
                />
              ) : (
                <ContentGrid movies={movies} series={series} searchTerm={""} />
              )}
            </div>
          </>
        )}
      </div>
    );
  },
);

CategoriesContent.displayName = "CategoriesContent";

export { CategoriesContent };

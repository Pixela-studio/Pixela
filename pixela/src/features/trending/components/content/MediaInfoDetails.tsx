import { formatYear } from "@/lib/date";
import { TrendingSerie, TrendingMovie } from "@/features/trending/types";
import { memo } from "react";
import { MediaInfoDetailsProps } from "@/features/trending/types/components";

/*
 * Pie de foto bajo el póster (DESIGN.md › Pósters): título y, debajo, año y
 * nota. Siempre visible, también en táctil, en lugar del velo que solo salía
 * con el ratón encima.
 */
const STYLES = {
  container: "pt-3",
  title: "text-[15px] md:text-base font-semibold leading-snug text-white line-clamp-2",
  info: "mt-1 flex items-center gap-3 text-sm text-gray-400 tabular-nums",
  rating: "text-white/85",
} as const;

/** Nota con coma decimal, como se escribe en castellano. */
const formatRating = (rating?: number) =>
  typeof rating === "number" && rating > 0 ? rating.toFixed(1).replace(".", ",") : null;

/**
 * Título, año y nota de una obra bajo su póster.
 * @param {MediaInfoDetailsProps} props - Props del componente
 * @returns {JSX.Element} Pie de foto
 */
export const MediaInfoDetails = memo(({ media, type }: MediaInfoDetailsProps) => {
  const title =
    type === "series" ? (media as TrendingSerie).name : (media as TrendingMovie).title;
  const releaseDate =
    type === "series" ? (media as TrendingSerie).first_air_date : (media as TrendingMovie).release_date;
  const year = formatYear(releaseDate, "");
  const rating = formatRating(media.vote_average);

  return (
    <div className={STYLES.container}>
      <h3 className={STYLES.title}>{title}</h3>
      <p className={STYLES.info}>
        {year && <span>{year}</span>}
        {rating && (
          <span className={STYLES.rating}>
            <span aria-hidden="true">★ </span>
            <span className="sr-only">Nota </span>
            {rating}
          </span>
        )}
      </p>
    </div>
  );
});

MediaInfoDetails.displayName = "MediaInfoDetails";

import { MediaMetadataProps } from "@/features/media/types/metadata";
import { Pelicula, Serie } from "@/features/media/types/content";
import { formatRuntime, formatYear } from "@/lib/date";

const STYLES = {
  container:
    "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-300",
  rating:
    "inline-flex items-center gap-1 rounded-md bg-pixela-accent/15 px-2 py-0.5 font-semibold text-pixela-accent",
  separator: "text-gray-600",
  top: "inline-flex items-center rounded-md border border-pixela-accent/30 bg-pixela-accent/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-pixela-accent",
} as const;

/** Puntuación a partir de la cual se destaca un título. */
const TOP_SCORE_THRESHOLD = 8;

/**
 * Fila de metadatos de la ficha: puntuación, año y duración o temporadas.
 *
 * Antes la puntuación vivía dentro de `MediaTitle` y los metadatos en otra fila
 * más abajo, de modo que los datos que sirven para decidir si ver algo estaban
 * repartidos en tres bloques. Los catálogos de referencia —Prime Video muestra
 * "IMDb 7.3 · 2022 · 7 episodes"— los agrupan en una sola línea escaneable.
 *
 * Corrige además el año: `new Date('').getFullYear()` devolvía `NaN`, que se
 * pintaba tal cual en los títulos sin fecha de estreno confirmada.
 */
export const MediaMetadata = ({ media }: MediaMetadataProps) => {
  const isSerie = media.tipo === "serie";
  const year = formatYear(media.fecha);

  const facts: string[] = [];

  if (isSerie) {
    const serie = media as Serie;
    if (serie.temporadas > 0) {
      facts.push(
        `${serie.temporadas} ${serie.temporadas === 1 ? "temporada" : "temporadas"}`,
      );
    }
    if (serie.episodios > 0) {
      facts.push(
        `${serie.episodios} ${serie.episodios === 1 ? "episodio" : "episodios"}`,
      );
    }
  } else {
    const runtime = formatRuntime((media as Pelicula).duracion);
    if (runtime) facts.push(runtime);
  }

  const entries = [year, ...facts].filter((value) => value !== "—");

  return (
    <div className={STYLES.container}>
      <span className={STYLES.rating}>
        <span aria-hidden="true">★</span>
        <span className="sr-only">Puntuación:</span>
        {media.puntuacion.toFixed(1)}
      </span>

      {media.puntuacion >= TOP_SCORE_THRESHOLD && (
        <span className={STYLES.top}>Top Pixela</span>
      )}

      {entries.map((entry, index) => (
        <span key={entry} className="flex items-center gap-2">
          <span className={STYLES.separator} aria-hidden="true">
            •
          </span>
          {entry}
          {index === entries.length - 1 && !isSerie && (
            <span className="sr-only"> de duración</span>
          )}
        </span>
      ))}
    </div>
  );
};

import { MediaMetadataProps } from "@/features/media/types/metadata";
import { Pelicula, Serie } from "@/features/media/types/content";
import { formatRuntime, formatYear } from "@/lib/date";
import { isTopPixela } from "@/lib/topPixela";
import { describeCertification } from "@/lib/certification";

const STYLES = {
  container:
    "flex flex-wrap items-center gap-x-5 gap-y-2 text-[15px] [font-stretch:112%] text-gray-400 tabular-nums",
  rating: "inline-flex items-center gap-1.5 font-semibold text-white",
  votes: "font-normal text-gray-400",
  certification:
    "inline-flex h-6 min-w-6 items-center justify-center rounded-sm border border-white/40 px-1.5 text-[13px] font-semibold text-white",
  badge: "inline-flex items-center rounded-sm bg-pixela-accent px-2 py-0.5 text-[13px] font-semibold text-pixela-dark",
  nextEpisode: "text-white/85",
} as const;

const NUMBER = new Intl.NumberFormat("es-ES");
const SHORT_DATE = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" });

/**
 * Fila de metadatos de la ficha.
 *
 * Reúne en una línea lo que sirve para decidir si ver algo: nota con su número
 * de votos (un 8,1 de 40 votos no es un 8,1 de 30.000), edad recomendada, año,
 * duración —por episodio en series— y si la serie sigue en emisión.
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
    const perEpisode = formatRuntime(serie.duracionEpisodio);
    if (perEpisode) facts.push(`${perEpisode} por episodio`);
    if (serie.estado) facts.push(serie.estado);
  } else {
    const runtime = formatRuntime((media as Pelicula).duracion);
    if (runtime) facts.push(runtime);
  }

  const entries = [year, ...facts].filter((value) => value !== "—");
  const next = isSerie ? (media as Serie).proximoEpisodio : undefined;
  const top = isTopPixela({ vote_average: media.puntuacion, vote_count: media.votos });

  return (
    <div className={STYLES.container}>
      <span className={STYLES.rating}>
        <span aria-hidden="true">★</span>
        <span className="sr-only">Puntuación:</span>
        {media.puntuacion.toFixed(1).replace(".", ",")}
        {media.votos ? (
          <span className={STYLES.votes}>
            · {NUMBER.format(media.votos)} {media.votos === 1 ? "voto" : "votos"}
          </span>
        ) : null}
      </span>

      {top && <span className={STYLES.badge}>Top Pixela</span>}

      {media.clasificacion && (
        <span
          className={STYLES.certification}
          title={describeCertification(media.clasificacion)}
        >
          <span aria-hidden="true">{media.clasificacion}</span>
          <span className="sr-only">{describeCertification(media.clasificacion)}</span>
        </span>
      )}

      {entries.map((entry) => (
        <span key={entry}>{entry}</span>
      ))}

      {next && (
        <span className={STYLES.nextEpisode}>
          Nuevo episodio el {SHORT_DATE.format(new Date(`${next.fecha}T12:00:00`))} (T{next.temporada}·E
          {next.episodio})
        </span>
      )}
    </div>
  );
};

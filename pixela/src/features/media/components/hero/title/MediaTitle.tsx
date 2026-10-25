interface MediaTitleProps {
  title: string;
}

const STYLES = {
  title:
    "font-display font-normal text-white text-[52px] sm:text-7xl lg:text-[104px] xl:text-[120px] 2k:text-[136px] leading-[0.88] tracking-[-0.04em] [text-wrap:balance] w-full [overflow-wrap:anywhere] hyphens-auto",
} as const;

/**
 * Título de la ficha.
 *
 * La puntuación y la insignia "Top Pixela" se han movido a `MediaMetadata`,
 * donde conviven con el año y la duración en una única fila de datos.
 */
export const MediaTitle = ({ title }: MediaTitleProps) => (
  <h1 className={STYLES.title}>{title}</h1>
);

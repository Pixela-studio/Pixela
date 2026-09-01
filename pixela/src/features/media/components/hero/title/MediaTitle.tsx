interface MediaTitleProps {
  title: string;
}

const STYLES = {
  title:
    "font-outfit text-3xl font-bold leading-[1.05] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl [text-wrap:balance]",
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

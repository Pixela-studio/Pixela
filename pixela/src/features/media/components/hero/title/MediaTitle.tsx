interface MediaTitleProps {
  title: string;
  /** Título original, solo cuando difiere del castellano. */
  originalTitle?: string;
}

const STYLES = {
  title:
    "font-display font-normal text-white text-[52px] sm:text-7xl lg:text-[104px] xl:text-[120px] 2k:text-[136px] leading-[0.88] tracking-[-0.04em] [text-wrap:balance] w-full [overflow-wrap:anywhere] hyphens-auto",
  original: "mt-3 text-lg italic text-gray-400 [overflow-wrap:anywhere]",
} as const;

/**
 * Título de la ficha.
 *
 * La puntuación y la insignia "Top Pixela" se han movido a `MediaMetadata`,
 * donde conviven con el año y la duración en una única fila de datos.
 */
export const MediaTitle = ({ title, originalTitle }: MediaTitleProps) => (
  <div className="w-full">
    <h1 className={STYLES.title}>{title}</h1>
    {/* Para citar una película o encontrarla en otra web hace falta el
        original: «Ladri di biciclette», no «Ladrón de bicicletas». */}
    {originalTitle && (
      <p className={STYLES.original}>
        <span className="sr-only">Título original: </span>
        {originalTitle}
      </p>
    )}
  </div>
);

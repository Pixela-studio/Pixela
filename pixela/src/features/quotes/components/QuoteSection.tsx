import { QuoteSectionProps } from "@/features/quotes/types/quotes";
import clsx from "clsx";

const STYLES = {
  // Misma línea de margen que los títulos de sección.
  wrapper: "w-full px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24",
  // La cita como un rótulo intercalado: Bodoni cursiva a tamaño de frase
  // destacada (no de titular), en marfil y a dos o tres líneas.
  quote:
    "font-display italic text-2xl md:text-[32px] leading-[1.25] tracking-[-0.01em] text-white/90 max-w-3xl [text-wrap:balance]",
  author: "mt-4 text-sm md:text-base text-gray-400",
};

/**
 * Props extendidas para soportar alineación
 */
type ExtendedQuoteSectionProps = QuoteSectionProps & {
  align?: "left" | "right";
};

/**
 * Componente de sección de cita
 * @param {ExtendedQuoteSectionProps} props - Props del componente
 * @returns {JSX.Element} Componente QuoteSection
 */
const QuoteSection = ({
  quote,
  align = "right",
}: ExtendedQuoteSectionProps) => {
  const containerClass = clsx(
    "flex pt-14 md:pt-20",
    align === "right"
      ? "justify-start text-left lg:justify-end lg:text-right"
      : "justify-start text-left lg:justify-start lg:text-left", // Si align es left, forzamos left en desktop también
  );

  return (
    <div className={STYLES.wrapper}>
      <div className={containerClass}>
        <figure>
          <blockquote className={STYLES.quote}>«{quote.quote}»</blockquote>
          <figcaption className={STYLES.author}>{quote.author}</figcaption>
        </figure>
      </div>
    </div>
  );
};

export default QuoteSection;

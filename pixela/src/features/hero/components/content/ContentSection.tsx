import Link from "next/link";
import { FiChevronRight, FiArrowUpRight } from "react-icons/fi";
import {
  HeroContent,
  HeroTitleProps,
  AccentLineProps,
  SecondaryButtonProps,
  HeroImage,
} from "@/features/hero/types/content";
import clsx from "clsx";
import { ProgressIndicator } from "@/features/hero/components/ui/ProgressIndicator";

const STYLES = {
  // Línea decorativa de acento (welcome estático)
  accentLine: {
    base: "w-16 md:w-24 lg:w-24 h-1 bg-pixela-accent",
    withMargin:
      "mb-5 md:mb-7 lg:mb-9 [@media(max-height:500px)_and_(orientation:landscape)]:mb-2",
  },

  // Tag de tipo (PELÍCULA / SERIE) — reemplaza la accent line en dinámico.
  typeTag:
    "inline-block text-[11px] sm:text-xs md:text-sm font-bold font-outfit uppercase tracking-[0.28em] text-pixela-accent mb-4 md:mb-5 lg:mb-6 [@media(max-height:500px)_and_(orientation:landscape)]:mb-2 drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]",

  // Título — común
  heroTitleBase:
    "text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2k:text-8xl font-black font-outfit text-pixela-light mb-5 md:mb-6 lg:mb-8 2k:mb-6 tracking-tight leading-[0.95] drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] [text-wrap:balance] [@media(max-height:500px)_and_(orientation:landscape)]:text-3xl [@media(max-height:500px)_and_(orientation:landscape)]:mb-2 line-clamp-3",
  // Welcome estático: uppercase (voz de marca).
  heroTitleStatic: "uppercase",
  // Dinámico: title case natural del título de peli/serie.
  heroTitleDynamic: "normal-case",
  heroTitleAccent: "text-pixela-accent",

  // Descripción — común
  descriptionBase:
    "text-base sm:text-lg md:text-lg lg:text-xl 2k:text-2xl max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl 2k:max-w-2xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] leading-relaxed [text-wrap:pretty] line-clamp-3 mt-5 md:mt-6 lg:mt-7 mb-8 md:mb-10 lg:mb-12 [@media(max-height:500px)_and_(orientation:landscape)]:mt-2 [@media(max-height:500px)_and_(orientation:landscape)]:mb-4",
  // Welcome estático: sans, medio peso.
  descriptionStatic: "text-pixela-light/85",
  // Dinámico: itálica + font-light — el overview se lee como reseña, no
  // como copy institucional.
  descriptionDynamic: "text-pixela-light/90 italic font-light",

  // CTA "Descubrir más" del welcome (chevron link).
  chevronCta: {
    base: "group inline-flex items-center transition-all duration-300",
    text: "font-medium text-pixela-light group-hover:text-white transition-all duration-300 mr-2 text-sm sm:text-base lg:text-base tracking-wide",
    icon: "h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-pixela-light group-hover:text-pixela-accent opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1",
  },

  // CTA "Ver detalles" cuando hay peli/serie activa (píldora accent).
  pillCta: {
    base: "group inline-flex items-center gap-2.5 px-6 py-3 md:px-7 md:py-3.5 rounded-full font-semibold text-sm md:text-base tracking-wide bg-pixela-accent text-white shadow-lg shadow-pixela-accent/30 hover:shadow-pixela-accent/50 hover:bg-pixela-accent/95 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300",
    icon: "h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
  },

  // Sección de contenido principal
  contentSection: {
    base: "absolute inset-x-0 bottom-0 z-10 px-4 sm:px-5 md:px-6 lg:px-0 2k:px-8",
    container:
      "w-full max-w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-[83.333%] 2k:max-w-[60%] mx-auto pb-20 sm:pb-24 md:pb-28 lg:pb-36 2k:pb-24 [@media(max-height:500px)_and_(orientation:landscape)]:pb-8",
    textCard:
      "w-fit max-w-full bg-pixela-dark/60 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-0 p-6 sm:p-7 md:p-8 lg:p-0 rounded-[24px] lg:rounded-none border border-white/10 lg:border-transparent shadow-2xl lg:shadow-none mb-6 md:mb-8 lg:mb-12 2k:mb-8",
    buttonsContainer:
      "flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 2k:gap-6 ipad:flex-col ipad:items-start ipad:gap-6",
    buttonWrapper: "ipad:w-full",
    progressWrapper: "hidden ipad:block ipad:w-full",
  },
} as const;

const typeLabel = (type?: HeroImage["type"]): string => {
  if (type === "movie") return "Película";
  if (type === "serie" || type === "tv") return "Serie";
  return "Destacado";
};

const AccentLine = ({ className }: AccentLineProps) => (
  <div className={clsx(STYLES.accentLine.base, className)} />
);

const HeroTitle = ({
  title,
  accentTitle,
  variant,
}: HeroTitleProps & { variant: "static" | "dynamic" }) => (
  <h1
    className={clsx(
      STYLES.heroTitleBase,
      variant === "static" ? STYLES.heroTitleStatic : STYLES.heroTitleDynamic,
    )}
  >
    {title}
    {accentTitle && (
      <>
        <br />
        <span className={STYLES.heroTitleAccent}>{accentTitle}</span>
      </>
    )}
  </h1>
);

const ChevronCta = ({ text, href }: SecondaryButtonProps) => (
  <Link href={href} className={STYLES.chevronCta.base}>
    <span className={STYLES.chevronCta.text}>{text}</span>
    <FiChevronRight className={STYLES.chevronCta.icon} />
  </Link>
);

const PillCta = ({ text, href }: SecondaryButtonProps) => (
  <Link href={href} className={STYLES.pillCta.base}>
    <span>{text}</span>
    <FiArrowUpRight className={STYLES.pillCta.icon} />
  </Link>
);

export const ContentSection = ({
  title,
  accentTitle,
  description,
  secondaryButtonText,
  images,
  currentImageIndex = 0,
}: HeroContent & { images: HeroImage[] }) => {
  const currentImage = images[currentImageIndex];
  const isDynamic = !!currentImage?.title;

  const displayTitle = currentImage?.title ?? title;
  const displayAccentTitle = isDynamic ? undefined : accentTitle;
  const displayDescription = currentImage?.description || description;

  const buttonHref = currentImage?.id
    ? `/${currentImage.type === "serie" ? "series" : "movies"}/${currentImage.id}`
    : "#tendencias";
  const buttonText = isDynamic ? "Ver detalles" : secondaryButtonText;

  return (
    <div className={STYLES.contentSection.base}>
      <div className={STYLES.contentSection.container}>
        <div key={currentImageIndex} className="animate-fade-in">
          <div className={STYLES.contentSection.textCard}>
            {isDynamic ? (
              <span className={STYLES.typeTag}>
                {typeLabel(currentImage?.type)}
              </span>
            ) : (
              <AccentLine className={STYLES.accentLine.withMargin} />
            )}

            <HeroTitle
              title={displayTitle}
              accentTitle={displayAccentTitle}
              variant={isDynamic ? "dynamic" : "static"}
            />

            <p
              className={clsx(
                STYLES.descriptionBase,
                isDynamic
                  ? STYLES.descriptionDynamic
                  : STYLES.descriptionStatic,
              )}
            >
              {displayDescription}
            </p>

            <div className={STYLES.contentSection.buttonWrapper}>
              {isDynamic ? (
                <PillCta text={buttonText} href={buttonHref} />
              ) : (
                <ChevronCta text={buttonText} href={buttonHref} />
              )}
            </div>
          </div>

          <div className={STYLES.contentSection.buttonsContainer}>
            <div className={STYLES.contentSection.progressWrapper}>
              <ProgressIndicator images={images} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

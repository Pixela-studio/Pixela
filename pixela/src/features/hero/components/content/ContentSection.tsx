import Link from "next/link";
import {
  HeroContent,
  HeroTitleProps,
  SecondaryButtonProps,
  HeroImage,
} from "@/features/hero/types/content";
import { ProgressIndicator } from "@/features/hero/components/ui/ProgressIndicator";

/*
 * El hero es un cartón de título (DESIGN.md › "Fundido a negro"): el nombre
 * de la obra en Bodoni a escala de cartel, una línea de metadatos encima y la
 * sinopsis debajo, alineados con el margen de la navbar. Sin panel de vidrio:
 * el velo de la imagen ya da contraste.
 */
const STYLES = {
  meta: "meta-text !text-white/75 mb-4 md:mb-6 ls:mb-2",

  heroTitleBase:
    "font-display font-normal text-white text-[56px] sm:text-7xl md:text-8xl lg:text-[112px] xl:text-[128px] 2k:text-[140px] leading-[0.9] tracking-[-0.035em] [text-wrap:balance] line-clamp-3 ls:text-4xl",

  description:
    "text-base sm:text-lg lg:text-[19px] leading-relaxed text-white/80 max-w-xl [text-wrap:pretty] line-clamp-3 mt-5 md:mt-7 mb-8 md:mb-10 ls:mt-2 ls:mb-4",

  primaryCta: "btn btn-primary",
  secondaryCta: "btn btn-ghost",

  contentSection: {
    base: "absolute inset-x-0 bottom-0 z-10",
    container:
      "w-full px-4 sm:px-6 md:px-10 lg:px-16 2k:px-24 pb-24 sm:pb-28 md:pb-32 lg:pb-40 2k:pb-28 ls:pb-8",
    textCard: "max-w-4xl",
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

const HeroTitle = ({ title, accentTitle }: HeroTitleProps) => (
  <h1 className={STYLES.heroTitleBase}>
    {title}
    {accentTitle && (
      <>
        <br />
        {accentTitle}
      </>
    )}
  </h1>
);

const PrimaryCta = ({ text, href }: SecondaryButtonProps) => (
  <Link href={href} prefetch={false} className={STYLES.primaryCta}>
    {text}
  </Link>
);

const SecondaryCta = ({ text, href }: SecondaryButtonProps) => (
  <Link href={href} className={STYLES.secondaryCta}>
    {text}
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
  const buttonText = isDynamic ? "Ver ficha" : secondaryButtonText;

  return (
    <div className={STYLES.contentSection.base}>
      <div className={STYLES.contentSection.container}>
        <div key={currentImageIndex} className="animate-fade-in">
          <div className={STYLES.contentSection.textCard}>
            <p className={STYLES.meta}>
              {isDynamic ? typeLabel(currentImage?.type) : "Pixela"}
            </p>

            <HeroTitle title={displayTitle} accentTitle={displayAccentTitle} />

            <p className={STYLES.description}>{displayDescription}</p>

            <div className={STYLES.contentSection.buttonWrapper}>
              {isDynamic ? (
                <PrimaryCta text={buttonText} href={buttonHref} />
              ) : (
                <SecondaryCta text={buttonText} href={buttonHref} />
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

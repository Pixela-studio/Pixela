import Link from "next/link";
import { FiChevronRight } from "react-icons/fi";
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
  // Línea decorativa de acento
  accentLine: {
    base: "w-16 md:w-24 lg:w-24 h-1 bg-pixela-accent",
    withMargin: "mb-5 md:mb-7 lg:mb-9 [@media(max-height:500px)_and_(orientation:landscape)]:mb-2",
  },

  // Título principal del hero — mismo concepto, refinado:
  // font-black en vez de bold, leading más cerrado, tracking coherente
  // entre breakpoints, drop-shadow más presente para legibilidad,
  // text-wrap: balance para que títulos largos rompan naturales.
  heroTitle: {
    base: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2k:text-8xl font-black font-outfit text-pixela-light mb-5 md:mb-6 lg:mb-8 2k:mb-6 tracking-tight uppercase leading-[0.95] drop-shadow-[0_2px_16px_rgba(0,0,0,0.55)] [text-wrap:balance] [@media(max-height:500px)_and_(orientation:landscape)]:text-3xl [@media(max-height:500px)_and_(orientation:landscape)]:mb-2",
    accent: "text-pixela-accent",
  },

  // Botón secundario con animación
  secondaryButton: {
    base: "group inline-flex items-center transition-all duration-300",
    text: "font-medium text-pixela-light group-hover:text-white transition-all duration-300 mr-2 text-sm sm:text-base lg:text-base tracking-wide",
    icon: "h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-pixela-light group-hover:text-pixela-accent opacity-80 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1",
  },

  // Sección de contenido principal
  contentSection: {
    base: "absolute inset-x-0 bottom-0 z-10 px-4 sm:px-5 md:px-6 lg:px-0 2k:px-8",
    container:
      "w-full max-w-[95%] sm:max-w-xl md:max-w-2xl lg:max-w-[83.333%] 2k:max-w-[60%] mx-auto pb-20 sm:pb-24 md:pb-28 lg:pb-36 2k:pb-24 [@media(max-height:500px)_and_(orientation:landscape)]:pb-8",
    textCard:
      "w-fit max-w-full bg-pixela-dark/60 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-0 p-6 sm:p-7 md:p-8 lg:p-0 rounded-[24px] lg:rounded-none border border-white/10 lg:border-transparent shadow-2xl lg:shadow-none mb-6 md:mb-8 lg:mb-12 2k:mb-8",
    description:
      "text-base sm:text-lg md:text-lg lg:text-xl 2k:text-2xl text-pixela-light/85 max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl 2k:max-w-2xl drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)] leading-relaxed [text-wrap:pretty] line-clamp-3 mt-5 md:mt-6 lg:mt-7 mb-8 md:mb-10 lg:mb-12 [@media(max-height:500px)_and_(orientation:landscape)]:mt-2 [@media(max-height:500px)_and_(orientation:landscape)]:mb-4",
    buttonsContainer:
      "flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 2k:gap-6 ipad:flex-col ipad:items-start ipad:gap-6",
    buttonWrapper: "ipad:w-full",
    progressWrapper: "hidden ipad:block ipad:w-full",
  },
} as const;

/**
 * Componente para la línea de acento
 * @param {AccentLineProps} props - Propiedades de la línea
 * @returns {JSX.Element} Componente de línea
 */
const AccentLine = ({ className }: AccentLineProps) => (
  <div className={clsx(STYLES.accentLine.base, className)} />
);

/**
 * Componente para el título del hero
 * @param {HeroTitleProps} props - Propiedades del título
 * @returns {JSX.Element} Componente de título
 */
const HeroTitle = ({
  title,
  accentTitle,
  inline = false,
}: HeroTitleProps & { inline?: boolean }) => (
  <h1 className={clsx(STYLES.heroTitle.base, "line-clamp-3")}>
    {title}
    {accentTitle && (
      <>
        {inline ? " " : <br />}
        <span className={STYLES.heroTitle.accent}>{accentTitle}</span>
      </>
    )}
  </h1>
);

/**
 * Componente para el botón secundario
 * @param {SecondaryButtonProps} props - Propiedades del botón
 * @returns {JSX.Element} Componente de botón
 */
const SecondaryButton = ({ text, href }: SecondaryButtonProps) => (
  <Link href={href} className={STYLES.secondaryButton.base}>
    <span className={STYLES.secondaryButton.text}>{text}</span>
    <FiChevronRight className={STYLES.secondaryButton.icon} />
  </Link>
);

/**
 * Componente que muestra la sección de contenido del hero
 * Incluye título, descripción y botones de acción
 */
/**
 * Componente que muestra la sección de contenido del hero
 * Incluye título, descripción y botones de acción
 */
export const ContentSection = ({
  title,
  accentTitle,
  description,
  secondaryButtonText,
  images,
  currentImageIndex = 0,
}: HeroContent & { images: HeroImage[] }) => {
  const currentImage = images[currentImageIndex];

  // Título dinámico: se muestra el título de la película/serie entero, sin
  // partirlo por la mitad. El accent color queda para el título estático
  // ("cinematográfico") que sí tiene un punto de corte natural.
  const isDynamic = !!currentImage?.title;
  const displayTitle = currentImage?.title ?? title;
  const displayAccentTitle = isDynamic ? undefined : accentTitle;

  // Descripción: line-clamp en CSS en vez de recortar por longitud a mano,
  // así el corte respeta el ancho real del contenedor.
  const displayDescription = currentImage?.description || description;

  // URL del botón: si es contenido dinámico, ir a los detalles.
  // Si es estático, ir a tendencias.
  const buttonHref = currentImage?.id
    ? `/${currentImage.type === "serie" ? "series" : "movies"}/${currentImage.id}`
    : "#tendencias";

  const buttonText = currentImage?.id ? "Ver detalles" : secondaryButtonText;

  return (
    <div className={STYLES.contentSection.base}>
      <div className={STYLES.contentSection.container}>
        <div key={currentImageIndex} className="animate-fade-in">
          <div className={STYLES.contentSection.textCard}>
            <AccentLine className={STYLES.accentLine.withMargin} />

            <HeroTitle
              title={displayTitle}
              accentTitle={displayAccentTitle}
              inline={false}
            />

            <p className={STYLES.contentSection.description}>
              {displayDescription}
            </p>

            {/* En móvil, el botón forma parte de la tarjeta para agrupar las llamadas a la acción */}
            <div className={STYLES.contentSection.buttonWrapper}>
              <SecondaryButton text={buttonText} href={buttonHref} />
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

/**
 * Interfaz que define la estructura del contenido del hero
 * @interface HeroContent
 * @property {string} title - Título del hero
 * @property {string} accentTitle - Título del hero
 * @property {string} description - Descripción del hero
 * @property {string} secondaryButtonText - Texto del botón secundario
 * @property {string[]} images - Imágenes del hero
 * @property {number} currentImageIndex - Índice de la imagen actual
 */
/**
 * Estructura de imagen responsiva para el Hero
 * @property {string} backdrop - URL de imagen para escritorio (horizontal)
 * @property {string} poster - URL de imagen para móvil (vertical)
 */
export interface HeroImage {
  id?: number | string;
  backdrop: string;
  poster: string;
  title?: string;
  description?: string;
  type?: "movie" | "tv" | "serie"; // 'serie' kept for compatibility if needed
}

/**
 * Interfaz que define la estructura del contenido del hero
 * @interface HeroContent
 * @property {string} title - Título del hero
 * @property {string} accentTitle - Título del hero
 * @property {string} description - Descripción del hero
 * @property {string} secondaryButtonText - Texto del botón secundario
 * @property {HeroImage[]} images - Imágenes del hero
 * @property {number} currentImageIndex - Índice de la imagen actual
 */
export interface HeroContent {
  title: string;
  accentTitle: string;
  description: string;
  secondaryButtonText: string;
  images: HeroImage[];
  currentImageIndex?: number;
}

/**
 * Interfaz para las propiedades del título del hero
 * @interface HeroTitleProps
 * @property {string} title - Título principal
 * @property {string} [accentTitle] - Título con acento (opcional: cuando la
 *   diapositiva es dinámica se usa el título de la película entero, sin
 *   trocearlo en dos, así que no hay accent)
 */
export interface HeroTitleProps {
  title: string;
  accentTitle?: string;
}

/**
 * Interfaz que define la estructura de los datos del hero
 * @interface HeroData
 * @property {string} title - Título principal
 * @property {string} accentTitle - Título con acento
 * @property {string} description - Descripción del hero
 * @property {string} secondaryButtonText - Texto del botón secundario
 * @property {HeroImage[]} images - Array de objetos de imágenes (backdrop + poster)
 */
export interface HeroData {
  title: string;
  accentTitle: string;
  description: string;
  secondaryButtonText: string;
  images: HeroImage[];
}

/**
 * Interfaz para las propiedades de la línea de acento
 * @interface AccentLineProps
 * @property {string} [className] - Clases CSS opcionales
 */
export interface AccentLineProps {
  className?: string;
}

/**
 * Interfaz para las propiedades del botón secundario
 * @interface SecondaryButtonProps
 * @property {string} text - Texto del botón
 * @property {string} href - URL de destino
 */
export interface SecondaryButtonProps {
  text: string;
  href: string;
}

/**
 * Props para el componente ImageCarousel
 * @property {HeroImage[]} images - Array de objetos de imágenes para el carrusel
 */
export interface ImageCarouselProps {
  images: HeroImage[];
}

/**
 * Props para el componente HeroSection
 * @property {string} title - Título principal del hero
 * @property {string} accentTitle - Título acentuado que complementa al título principal
 * @property {string} description - Descripción detallada de la sección
 * @property {string} secondaryButtonText - Texto del botón secundario
 * @property {HeroImage[]} [images] - Array opcional de objetos de imágenes para el carrusel
 */
export interface HeroSectionProps {
  title: string;
  accentTitle: string;
  description: string;
  secondaryButtonText: string;
  images?: HeroImage[];
}

/**
 * Props para el componente NavigationControls
 * @property {number} imagesLength - Número total de imágenes en el carrusel
 */
export interface NavigationControlsProps {
  imagesLength: number;
}

/**
 * Props para el componente NavigationButton
 * @property {'prev' | 'next'} direction - Dirección del botón de navegación
 * @property {() => void} onClick - Función que se ejecuta al hacer clic en el botón
 */
export interface NavigationButtonProps {
  direction: "prev" | "next";
  onClick: () => void;
}

/**
 * Tipo que representa un medio audiovisual (película o serie)
 * @property {string} id - Identificador único del medio
 * @property {'movie' | 'serie'} type - Tipo de medio (película o serie)
 */
export type MediaItem = {
  id: string;
  type: "movie" | "serie";
};

/**
 * Props para el componente ProgressIndicator
 * @property {HeroImage[]} images - Array de objetos de imágenes para el carrusel
 */
export interface ProgressIndicatorProps {
  images: HeroImage[];
}

/**
 * Tipo que representa la respuesta de la API para un medio
 * @property {string} [backdrop] - URL opcional del fondo del medio
 * @property {string} [poster] - URL opcional del poster del medio
 */
export type MediaResponse = {
  backdrop?: string;
  poster?: string;
};

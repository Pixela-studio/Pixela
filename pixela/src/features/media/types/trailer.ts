
/**
 * Trailer
 * @interface Trailer
 * @property {string} id - ID del trailer
 * @property {string} nombre - Nombre del trailer
 * @property {string} key - Clave del trailer
 * @property {string} site - Sitio web del trailer
 * @property {string} tipo - Tipo de trailer
 */
export interface Trailer {
    id: string;
    nombre: string;
    key: string;
    site: string;
    tipo: string;
    /** «Castellano», «VO» u otro idioma. */
    idioma?: string;
  }

/**
 * Propiedades del componente TrailerList
 * @interface TrailerListProps
 * @property {Trailer[]} trailers - Lista de trailers
 * @property {string} selectedTrailerId - ID del trailer seleccionado
 * @property {() => void} onSelectTrailer - Función que se ejecuta al seleccionar un trailer
 */
export interface TrailerListProps {
  trailers: Trailer[];
  selectedTrailerId: string;
  onSelectTrailer: (key: string) => void;
}

/**
 * Propiedades del componente TrailerPlayer
 * @interface TrailerPlayerProps
 * @property {string} trailerId - ID del trailer
 */
export interface TrailerPlayerProps {
  trailer: Trailer;
}

/**
 * Propiedades del componente TrailersSection
 * @interface TrailersSectionProps
 * @property {Trailer[]} trailers - Lista de trailers
 */
export interface TrailersSectionProps {
  trailers: Trailer[];
}
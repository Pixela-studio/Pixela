import { WatchProvider } from './supplements';

/**
 * Props para el componente PlatformCard
 * @interface PlatformCardProps
 * @property {WatchProvider} provider - Proveedor de streaming
 */
export interface PlatformCardProps {
  provider: WatchProvider;
  /** Página «Dónde ver» del título en TMDB, para plataformas sin URL conocida. */
  fallbackUrl?: string;
  /** Está entre «Mis plataformas». */
  isMine?: boolean;
} 



/**
 * Props para el componente StreamingProviders
 * @interface StreamingProvidersProps
 * @property {WatchProvider[]} providers - Proveedores de streaming
 */
export interface StreamingProvidersProps {
  providers: WatchProvider[];
  /** Página «Dónde ver» del título en TMDB para España. */
  watchUrl?: string;
}
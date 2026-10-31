import { Media } from './mediaBase';

/**
 * Props para el componente CreatorAvatar
 * @interface CreatorAvatarProps
 * @property {string} [photo] - URL de la foto del creador (opcional)
 * @property {string} name - Nombre del creador
 */
export interface CreatorAvatarProps {
  photo?: string;
  name: string;
  /** Id de TMDB: si llega, el avatar enlaza a la ficha de la persona. */
  personId?: string;
} 

/**
 * Props para el componente CreatorInfo
 * @interface CreatorInfoProps
 * @property {Media} media - Media
 */
export interface CreatorInfoProps {
  media: Media;
}
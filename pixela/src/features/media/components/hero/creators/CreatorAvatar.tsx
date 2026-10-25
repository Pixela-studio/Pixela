"use client";

import Image from 'next/image';
import { useState, memo } from 'react';
import { FiUser } from 'react-icons/fi';
import { CreatorAvatarProps } from '@/features/media/types/creators';

const STYLES = {
  container: 'flex items-center gap-2',
  avatarContainer: 'relative w-10 h-10',
  avatar: 'rounded-full object-cover border-2 border-pixela-accent/30',
  name: 'text-white font-medium',
  placeholderContainer: 'w-10 h-10 rounded-full border-2 border-pixela-accent/30 bg-gradient-to-br from-pixela-dark via-pixela-dark/80 to-black flex items-center justify-center',
  placeholderIcon: 'h-5 w-5 text-white/40',
  placeholderInitials: 'text-white text-sm font-semibold'
} as const;

/**
 * Componente placeholder para avatar de director/creador
 * @param {string} name - Nombre del director/creador
 * @returns {JSX.Element} Componente de avatar de director/creador
 */
const AvatarPlaceholder = memo(({ name }: { name: string }) => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <div className={STYLES.placeholderContainer}>
      {initials ? (
        <span className={STYLES.placeholderInitials}>{initials}</span>
      ) : (
        <FiUser className={STYLES.placeholderIcon} aria-hidden="true" />
      )}
    </div>
  );
});

AvatarPlaceholder.displayName = 'AvatarPlaceholder';

/**
 * Componente que muestra el avatar de un director/creador
 * @param {CreatorAvatarProps} props - Propiedades del componente
 * @param {string} props.photo - URL de la foto del director/creador
 * @param {string} props.name - Nombre del director/creador
 * @returns {JSX.Element} Componente de avatar de director/creador
 */
export const CreatorAvatar = ({ photo, name }: CreatorAvatarProps) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={STYLES.container}>
      <div className={STYLES.avatarContainer}>
        {!photo || photo.trim() === '' || imageError ? (
          <AvatarPlaceholder name={name} />
        ) : (
          <Image 
            src={photo} 
            alt={name}
            className={STYLES.avatar}
            fill
            sizes="40px"
            style={{objectFit: 'cover'}}
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <span className={STYLES.name}>{name}</span>
    </div>
  );
}; 
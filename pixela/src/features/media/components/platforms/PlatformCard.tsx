import Image from 'next/image';
import { getPlatformUrl } from './platformUtils';
import { formatImageUrl } from '@/api/peliculas/mapper/mapPelicula';
import { PlatformCardProps } from '@/features/media/types/platforms';

/**
 * Tarjeta de una plataforma de streaming. Es un enlace real (antes era un
 * `div role="button"` sin soporte de teclado): se enfoca con Tab, se abre con
 * Enter y el lector de pantalla anuncia que abre una pestaña nueva.
 * @param {PlatformCardProps} props - Propiedades del componente
 * @returns {JSX.Element} Enlace a la plataforma de streaming
 */
export function PlatformCard({ provider }: PlatformCardProps) {
  const name = provider.nombre || String(provider.id || 'Plataforma');
  const href = getPlatformUrl(provider);

  // Verificar y formatear URL del logo
  const logoUrl = provider.logo?.startsWith('http')
    ? provider.logo
    : formatImageUrl(provider.logo);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver en ${name} (se abre en una pestaña nueva)`}
      className="p-3 rounded-2xl flex items-center gap-3 bg-pixela-surface border border-white/10 hover:border-white/20 hover:-translate-y-0.5 transition-[transform,border-color] duration-300 ease-out-expo select-none"
    >
      <div className="relative flex-shrink-0 w-8 h-8 overflow-hidden rounded-md">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            className="object-contain w-full h-full"
            width={32}
            height={32}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex items-center justify-center w-full h-full text-xs text-gray-400 bg-pixela-raised"
          >
            {name.substring(0, 2)}
          </div>
        )}
      </div>
      <span className="font-medium text-white truncate">{name}</span>
    </a>
  );
}

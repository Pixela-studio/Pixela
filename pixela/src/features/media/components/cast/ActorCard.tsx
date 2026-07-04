import { ActorCardProps } from '@/features/media/types/cast';
import Image from 'next/image';
import { memo, useState } from 'react';
import clsx from 'clsx';
import { FiUser } from 'react-icons/fi';
import Link from 'next/link';

/**
 * Componente que muestra una tarjeta de actor con su imagen y detalles
 * @param {ActorCardProps} props - Propiedades del componente
 * @param {Actor} props.actor - Datos del actor a mostrar
 * @param {string} [props.className] - Clases CSS opcionales para personalizar el estilo
 * @returns {JSX.Element} Componente de tarjeta de actor
 */
export const ActorCard = memo(function ActorCard({ actor, className = '' }: ActorCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidImage = actor.foto && !imageError;

  return (
    <Link 
      href={`/actor/${actor.id}`}
      className={clsx(
        "block bg-[#1A1A1A] rounded-xl overflow-hidden group hover:bg-[#252525] hover:scale-105 transition duration-300 shadow-lg shadow-black/10 cursor-pointer",
        className
      )}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        {hasValidImage ? (
          <Image 
            src={actor.foto || ''} 
            alt={actor.nombre}
            fill
            sizes="(max-width: 640px) 140px, (max-width: 768px) 160px, 180px"
            className="object-cover"
            priority={false}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gray-800">
            <FiUser className="w-1/3 text-gray-400 h-1/3" />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Nombre:</span>
          <h3 className="text-sm font-medium text-white truncate">{actor.nombre}</h3>
        </div>
        {actor.personaje && (
          <div className="flex flex-col mt-1">
            <span className="text-xs text-gray-500">Personaje:</span>
            <p className="text-xs font-medium text-gray-300 truncate">{actor.personaje}</p>
          </div>
        )}
      </div>
    </Link>
  );
});

ActorCard.displayName = 'ActorCard'; 
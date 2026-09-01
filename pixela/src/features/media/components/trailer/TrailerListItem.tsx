"use client";

import { FaPlay } from "react-icons/fa";
import { Trailer } from '@/features/media/types/trailer';
import Image from 'next/image';

/**
 * Propiedades del componente TrailerListItem
 * @interface TrailerListItemProps
 * @property {Trailer} trailer - Trailer a mostrar
 * @property {boolean} isSelected - Indica si el trailer está seleccionado
 * @property {() => void} onSelect - Función que se ejecuta al seleccionar el trailer
 */
interface TrailerListItemProps {
  trailer: Trailer;
  isSelected: boolean;
  onSelect: () => void;
  index?: number;
  isLarge?: boolean;
}

const TrailerListItem = ({ 
  trailer, 
  isSelected, 
  onSelect,
  index,
  isLarge = false
}: TrailerListItemProps) => {
  return (
    <button
      onClick={onSelect}
      className={`
        flex items-stretch rounded-xl overflow-hidden transition-all duration-200
        ${isLarge ? 'min-h-[100px] h-24' : 'min-h-[80px] h-20'} flex-shrink-0
        ${isSelected
          ? 'bg-gradient-to-r from-pixela-accent/20 to-[#1a1a1a]/95 border border-pixela-accent/30 shadow-lg shadow-pixela-accent/10'
          : 'bg-gradient-to-br from-[#181818]/95 to-[#1a1a1a]/95 border border-white/5'}
      `}
    >
      {/* Miniatura */}
      <div className={`relative ${isLarge ? 'w-36' : 'w-28'} h-full flex-shrink-0`}>
        <Image
          src={`https://img.youtube.com/vi/${trailer.key}/default.jpg`}
          alt={trailer.nombre || 'Video thumbnail'}
          fill
          className={`object-cover transition-all duration-300 ${
            isSelected ? 'brightness-110 contrast-110' : 'brightness-90'
          }`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`rounded-full ${isLarge ? 'p-2' : 'p-1.5'} transition-all duration-200 ${
            isSelected
              ? 'bg-white/20 backdrop-blur-sm scale-110'
              : 'bg-black/40'
          }`}>
            <FaPlay className={`${isLarge ? 'w-3 h-3' : 'w-2.5 h-2.5'} ${
              isSelected ? 'text-white' : 'text-gray-300'
            }`} />
          </div>
        </div>
      </div>
      
      {/* Información del trailer */}
      <div className={`${isLarge ? 'p-4 pl-5' : 'p-3 pl-4'} text-left flex flex-col justify-center flex-grow min-w-0`}>
        <p className={`${isLarge ? 'text-base' : 'text-sm'} leading-tight truncate transition-colors duration-200 ${
          isSelected ? 'text-white font-medium' : 'text-gray-300'
        }`}>
          {trailer.nombre || `Trailer ${index !== undefined ? index + 1 : ''}`}
        </p>
        <p className={`${isLarge ? 'text-sm mt-1.5' : 'text-xs mt-1'} text-gray-500 truncate`}>
          {trailer.tipo || 'Video'}
        </p>
      </div>
    </button>
  );
};

export default TrailerListItem; 
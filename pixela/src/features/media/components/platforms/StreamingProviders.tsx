import { PlatformCard } from './PlatformCard';
import { StreamingProvidersProps } from '@/features/media/types/platforms';

/**
 * Componente que muestra los proveedores de streaming de una película o serie
 * @param {StreamingProvidersProps} props - Propiedades del componente
 * @param {WatchProvider[]} props.providers - Proveedores de streaming
 * @returns {JSX.Element} Componente de proveedores de streaming
 */
export function StreamingProviders({ providers }: StreamingProvidersProps) {
  // Verificación y registro para depuración
  if (process.env.NODE_ENV === 'development') {
    console.log('[DEBUG] StreamingProviders - Proveedores recibidos:', providers);
  }
  
  if (!providers || providers.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG] StreamingProviders - No hay proveedores disponibles');
    }
    return null;
  }
  
  return (
    <section>
      <h2 className="title-card mb-8 text-5xl md:text-6xl">Dónde verla</h2>
      <div className="flex flex-wrap gap-4">
        {providers.map((provider) => (
          <PlatformCard 
            key={provider.id || provider.nombre}
            provider={provider} 
          />
        ))}
      </div>
    </section>
  );
} 
'use client';

import { PlatformCard } from './PlatformCard';
import { useMyPlatforms } from '@/hooks/useMyPlatforms';
import { StreamingProvidersProps } from '@/features/media/types/platforms';
import type { WatchProvider } from '@/features/media/types';

const GROUPS: Array<{ tipo: NonNullable<WatchProvider['tipo']>; titulo: string; nota?: string }> = [
  { tipo: 'flatrate', titulo: 'Incluida en tu suscripción' },
  { tipo: 'rent', titulo: 'Alquiler', nota: 'Pago por verla unos días.' },
  { tipo: 'buy', titulo: 'Compra', nota: 'Pago para tenerla siempre.' },
];

/**
 * Dónde ver el título en España, separado en incluido, alquiler y compra.
 *
 * Antes era una sola fila: una familia que ya paga dos plataformas no sabía si
 * la película estaba en su suscripción o le iba a costar cuatro euros.
 */
export function StreamingProviders({ providers, watchUrl }: StreamingProvidersProps) {
  const { ids: myPlatforms } = useMyPlatforms();

  if (!providers || providers.length === 0) return null;

  const mine = providers.filter(
    (provider) => (provider.tipo ?? 'flatrate') === 'flatrate' && myPlatforms.includes(Number(provider.id)),
  );

  // Datos antiguos sin tipo: se tratan como incluidos para no perderlos.
  const byKind = (tipo: WatchProvider['tipo']) =>
    providers.filter((provider) => (provider.tipo ?? 'flatrate') === tipo);

  return (
    <section aria-labelledby="donde-ver-title">
      <h2 id="donde-ver-title" className="title-card mb-8 text-5xl md:text-6xl">
        Dónde verla
      </h2>
      {/* Con «Mis plataformas» elegidas, la respuesta a «¿la tengo?» va
          primero, sin tener que leer la lista. */}
      {myPlatforms.length > 0 && (
        <p className="mb-6 text-base text-white" role="status">
          {mine.length > 0
            ? `Incluida en tu ${mine.map((provider) => provider.nombre).join(', ')}.`
            : 'No está incluida en ninguna de tus plataformas.'}
        </p>
      )}
      <div className="flex flex-col gap-8">
        {GROUPS.map(({ tipo, titulo, nota }) => {
          const list = byKind(tipo);
          if (list.length === 0) return null;
          return (
            <div key={tipo}>
              <h3 className="meta-text mb-3">
                <span className="text-white">{titulo}</span>
                {nota && <span className="ml-2">{nota}</span>}
              </h3>
              <div className="flex flex-wrap gap-4">
                {list.map((provider) => (
                  <PlatformCard
                    key={`${tipo}-${provider.id || provider.nombre}`}
                    provider={provider}
                    fallbackUrl={watchUrl}
                    isMine={tipo === 'flatrate' && myPlatforms.includes(Number(provider.id))}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {watchUrl && (
        <p className="mt-6 text-sm text-gray-400">
          Datos de disponibilidad en España de JustWatch vía{' '}
          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-4"
          >
            TMDB
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
          . Comprueba el precio en la plataforma antes de pagar.
        </p>
      )}
    </section>
  );
}

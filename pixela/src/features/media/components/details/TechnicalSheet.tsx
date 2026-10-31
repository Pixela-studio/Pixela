import type { Media } from '@/features/media/types';

const STYLES = {
  title: 'title-card mb-8 text-5xl md:text-6xl',
  list: 'grid max-w-4xl grid-cols-1 gap-x-12 gap-y-5 sm:grid-cols-2',
  term: 'meta-text',
  detail: 'mt-1 text-base text-white [overflow-wrap:anywhere]',
} as const;

interface TechnicalSheetProps {
  media: Media;
}

/**
 * Ficha técnica: título original, país, idioma y equipo.
 *
 * Javi y Nuria la pedían para citar una película en un trabajo o montar un
 * ciclo; los datos ya llegaban en el detalle y en `credits`, pero el mapper los
 * descartaba. Si no hay nada que contar, no se pinta.
 */
export function TechnicalSheet({ media }: TechnicalSheetProps) {
  const rows: Array<{ term: string; detail: string }> = [];

  if (media.tituloOriginal) rows.push({ term: 'Título original', detail: media.tituloOriginal });
  if (media.paises?.length) {
    rows.push({ term: media.paises.length === 1 ? 'País' : 'Países', detail: media.paises.join(', ') });
  }
  if (media.idiomaOriginal) {
    rows.push({
      term: 'Idioma original',
      detail: media.idiomaOriginal.charAt(0).toUpperCase() + media.idiomaOriginal.slice(1),
    });
  }

  const byJob = new Map<string, string[]>();
  for (const credit of media.equipo ?? []) {
    byJob.set(credit.oficio, [...(byJob.get(credit.oficio) ?? []), credit.nombre]);
  }
  for (const [oficio, nombres] of byJob) rows.push({ term: oficio, detail: nombres.join(', ') });

  if (rows.length === 0) return null;

  return (
    <section aria-labelledby="ficha-tecnica-title">
      <h2 id="ficha-tecnica-title" className={STYLES.title}>
        Ficha técnica
      </h2>
      <dl className={STYLES.list}>
        {rows.map((row) => (
          <div key={row.term}>
            <dt className={STYLES.term}>{row.term}</dt>
            <dd className={STYLES.detail}>{row.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

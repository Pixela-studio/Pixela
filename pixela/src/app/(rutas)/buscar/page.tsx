import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchPage } from '@/features/search/SearchPage';

export const metadata: Metadata = {
  title: 'Buscar · Pixela',
  description: 'Busca películas, series y personas.',
  // Una página de resultados por consulta posible: no tiene nada que indexar.
  robots: { index: false, follow: false },
};

export default function BuscarPage() {
  // `SearchPage` lee `?q=` con `useSearchParams`, que exige un límite de Suspense.
  return (
    <Suspense fallback={null}>
      <SearchPage />
    </Suspense>
  );
}

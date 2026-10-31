'use client';

import { Suspense } from 'react';
import { CategoriesContainer } from '@/features/categories/components';

export default function CategoriesPage() {
    // `CategoriesContainer` lee el estado de la URL con `useSearchParams`, que
    // en el App Router exige un límite de Suspense.
    return (
        <Suspense fallback={null}>
            <CategoriesContainer />
        </Suspense>
    );
}

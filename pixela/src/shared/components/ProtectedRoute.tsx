'use client';

import { ReactNode, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';
import Error403 from '@/app/errors/error-403';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const STYLES = {
  loadingContainer: "min-h-screen bg-gradient-to-br from-pixela-ink via-pixela-dark to-pixela-ink flex flex-col items-center justify-center pt-20",
  loadingContent: "text-center",
  loadingSpinner: "animate-spin rounded-full h-12 w-12 border-b-2 border-pixela-accent mx-auto mb-4",
  loadingText: "text-gray-300"
} as const;

/**
 * Puerta de acceso en cliente.
 *
 * Es una capa de experiencia de usuario, no de seguridad: la autorización real
 * la aplican las route handlers con `requireUser` / `requireAdmin`, y
 * `proxy.ts` evita que se llegue a renderizar sin cookie de sesión.
 *
 * Se ha eliminado el efecto que leía `forceLogout` de `localStorage` y disparaba
 * un `setTimeout` de redirección: competía con los temporizadores del Navbar y
 * del store, y podía expulsar de la página a un usuario perfectamente válido si
 * la bandera quedaba huérfana de un cierre de sesión anterior.
 */
const noopSubscribe = () => () => {};

/**
 * `false` en el servidor y durante la hidratación; `true` después.
 *
 * En el servidor `providers.tsx` fija la sesión a `null` (no ve la cookie
 * pista), así que `status` es `"unauthenticated"` y aquí se pintaba la 403; en
 * el cliente con sesión el `status` arranca en `"loading"` y se pintaba el
 * spinner. Las dos versiones no coincidían y React tiraba la hidratación de
 * todo `/profile`. Hasta hidratar se pinta siempre el estado de carga.
 */
const useHydrated = () =>
  useSyncExternalStore(noopSubscribe, () => true, () => false);

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const hydrated = useHydrated();

  if (!hydrated || status === 'loading') {
    return (
      <div className={STYLES.loadingContainer}>
        <div className={STYLES.loadingContent}>
          <div className={STYLES.loadingSpinner} role="status" aria-label="Cargando" />
          <p className={STYLES.loadingText}>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && status !== 'authenticated') {
    return <Error403 />;
  }

  if (requireAdmin && !session?.user?.isAdmin) {
    return <Error403 />;
  }

  return <>{children}</>;
}

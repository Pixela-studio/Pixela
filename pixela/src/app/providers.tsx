'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Wrapper de providers para la aplicación
 * Incluye SessionProvider de NextAuth
 */
export function Providers({ children }: ProvidersProps) {
  return (
    /*
     * `refetchOnWindowFocus` viene activado por defecto en Auth.js: cada vez que
     * la pestaña recupera el foco se pide `/api/auth/session`. Con la app abierta
     * en una pestaña de fondo —el caso normal— eso son decenas de peticiones por
     * sesión, cada una con su invocación de función, y además para visitantes
     * anónimos que nunca van a tener sesión.
     *
     * La sesión es un JWT en cookie con caducidad propia: no cambia porque el
     * usuario vuelva a la pestaña. Los puntos en los que sí cambia (login,
     * logout, actualización de perfil) ya la refrescan explícitamente.
     *
     * `refetchWhenOffline={false}` evita además el reintento al recuperar
     * conexión, que llegaba en ráfaga.
     */
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  );
}

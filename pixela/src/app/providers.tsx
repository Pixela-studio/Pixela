'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useState } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

/** Debe coincidir con `SESSION_HINT_COOKIE` en `src/proxy.ts`. */
const SESSION_HINT_COOKIE = 'pixela.has-session';

/**
 * ¿Hay indicios de sesión en este navegador?
 *
 * En el servidor devuelve `false`, que es lo correcto: el HTML de las páginas
 * está cacheado (estático/ISR) y no puede depender de las cookies de nadie.
 */
function hasSessionHint(): boolean {
  if (typeof document === 'undefined') return false;

  return document.cookie
    .split('; ')
    .some((entry) => entry === `${SESSION_HINT_COOKIE}=1`);
}

/**
 * Wrapper de providers para la aplicación
 * Incluye SessionProvider de NextAuth
 */
export function Providers({ children }: ProvidersProps) {
  /*
   * `session={null}` evita por completo la llamada a `/api/auth/session`.
   *
   * Comprobado en `node_modules/next-auth/react.js`: `SessionProvider` hace
   * `hasInitialSession = props.session !== undefined` y, si es cierto, asigna
   * `__NEXTAUTH._session = props.session`. Al montar llama a `_getSession()`,
   * que solo sale a la red `if (__NEXTAUTH._session === undefined)`. Pasando
   * `null` esa condición es falsa y no hay petición.
   *
   * Antes se preguntaba en **toda** carga de página, incluida la del visitante
   * anónimo, para recibir un `null` que ya sabíamos. Ahora solo se pregunta si
   * el proxy dejó la cookie pista, es decir si de verdad hay sesión que leer.
   *
   * Sobre hidratación: pasar `null` en vez de `undefined` cambia `status` de
   * `"loading"` a `"unauthenticated"`, pero eso no altera el HTML. El `Navbar`
   * —único consumidor en páginas públicas— no renderiza según `status`: vuelca
   * la sesión en `useAuthStore` y pinta desde ahí, y el estado inicial del store
   * es idéntico al que deja `syncWithSession(null)`. `ProtectedRoute` sí mira
   * `status`, pero solo vive en `/profile`, adonde no se llega sin cookie de
   * sesión, y por tanto sin cookie pista.
   *
   * Iniciar sesión sigue funcionando aunque aquí se haya fijado `null`:
   * `signIn()` termina llamando a `_getSession({ event: "storage" })`, y esa
   * rama sale a la red incondicionalmente (`node_modules/next-auth/react.js`).
   * Lo mismo `signOut()`. Por eso el valor se congela con `useState`: solo
   * decide la petición *inicial*, y no debe recalcularse en cada render.
   *
   * `refetchOnWindowFocus` viene activado por defecto en Auth.js: cada vez que
   * la pestaña recupera el foco se pide `/api/auth/session`. Con la app abierta
   * en una pestaña de fondo eso son decenas de peticiones por sesión. La sesión
   * es un JWT en cookie con caducidad propia: no cambia porque el usuario vuelva
   * a la pestaña, y los puntos en los que sí cambia (login, logout, cambio de
   * perfil) ya la refrescan explícitamente.
   */
  const [skipInitialFetch] = useState(() => !hasSessionHint());

  return (
    <SessionProvider
      session={skipInitialFetch ? null : undefined}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  );
}

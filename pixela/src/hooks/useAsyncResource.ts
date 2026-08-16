"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { logger } from "@/lib/logger";

interface AsyncResourceState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

interface UseAsyncResourceOptions {
  /** Mensaje mostrado al usuario si la carga falla. */
  errorMessage?: string;
  /** Etiqueta para el log del servidor/consola. */
  label?: string;
  /** Si es `false`, no se carga nada hasta que pase a `true`. */
  enabled?: boolean;
}

/**
 * Carga un recurso asíncrono y expone `{ data, loading, error, reload, setData }`.
 *
 * Sustituye al bloque
 * `useEffect(() => { setLoading(true); api.list().then(setX).catch(setErr).finally(...) }, [])`
 * que estaba copiado casi literalmente en `ProfileFavorites`, `ProfileReviews`,
 * `ProfileUsers`, `useLibraryItems`, `useProfileStats` y `BannerSelectorModal`.
 *
 * Además arregla dos defectos que arrastraban todas esas copias:
 *
 * 1. Ninguna cancelaba al desmontar salvo `useLibraryItems`, así que una
 *    navegación rápida provocaba un `setState` sobre un componente muerto.
 * 2. No había protección contra respuestas fuera de orden: dos recargas
 *    solapadas podían dejar en pantalla el resultado de la más antigua.
 */
export function useAsyncResource<T>(
  fetcher: () => Promise<T>,
  initialData: T,
  { errorMessage = "No se pudieron cargar los datos", label, enabled = true }: UseAsyncResourceOptions = {},
) {
  const [state, setState] = useState<AsyncResourceState<T>>({
    data: initialData,
    loading: enabled,
    error: null,
  });

  // Contador de peticiones: solo la más reciente puede escribir el estado.
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    if (!enabled) return;

    const currentRequest = ++requestId.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const data = await fetcher();
      if (!mounted.current || currentRequest !== requestId.current) return;
      setState({ data, loading: false, error: null });
    } catch (error) {
      logger.error(label ? `Failed to load ${label}` : "Async resource failed", error);
      if (!mounted.current || currentRequest !== requestId.current) return;
      setState((prev) => ({ ...prev, loading: false, error: errorMessage }));
    }
  }, [fetcher, enabled, errorMessage, label]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Actualización optimista local (p. ej. tras borrar un elemento). */
  const setData = useCallback((updater: T | ((previous: T) => T)) => {
    setState((prev) => ({
      ...prev,
      data:
        typeof updater === "function"
          ? (updater as (previous: T) => T)(prev.data)
          : updater,
    }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    reload: load,
    setData,
    setError,
  };
}

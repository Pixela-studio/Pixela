"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * «Mis plataformas»: las suscripciones de streaming que tiene quien mira.
 *
 * Se guardan en este navegador y no en la cuenta: sirven sin registrarse
 * (Andrea, en el beta test, no quería darse de alta para filtrar), no cuestan
 * ninguna petición y no son un dato que haga falta en el servidor. Si el
 * almacenamiento no está disponible (modo privado, bloqueado), funciona igual
 * durante la visita y simplemente no se recuerda.
 */

const STORAGE_KEY = "pixela.mis-plataformas";
const CHANGE_EVENT = "pixela:mis-plataformas";

const EMPTY: readonly number[] = Object.freeze([]);
let cache: { raw: string | null; ids: readonly number[] } = { raw: null, ids: EMPTY };
let memoryFallback: string | null = null;

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryFallback;
  }
}

function getSnapshot(): readonly number[] {
  const raw = readRaw();
  if (raw === cache.raw) return cache.ids;
  let ids: readonly number[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      ids = parsed.filter((value): value is number => Number.isInteger(value) && value > 0);
    }
  } catch {
    ids = EMPTY;
  }
  cache = { raw, ids };
  return ids;
}

const getServerSnapshot = () => EMPTY;

function subscribe(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function write(ids: readonly number[]) {
  const raw = JSON.stringify([...new Set(ids)]);
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    memoryFallback = raw;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useMyPlatforms() {
  const ids = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((id: number) => {
    const current = getSnapshot();
    write(current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }, []);

  const clear = useCallback(() => write([]), []);

  return { ids, toggle, clear };
}

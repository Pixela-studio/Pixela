"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

/**
 * Modo ligero: para conexiones lentas o con datos contados (Tomás, en un
 * pueblo con 3G y un Android de hace cinco años).
 *
 * - Automático si el navegador pide ahorro de datos (`Save-Data`,
 *   `prefers-reduced-data`) o la conexión es 3G o peor.
 * - Manual con el interruptor del pie, que manda sobre lo automático y se
 *   recuerda en este navegador.
 *
 * Lo que cambia: el hero monta una sola imagen y no rota, los tráileres no
 * descargan miniatura hasta que se pulsan y fuera el grano y las animaciones
 * (clase `lite` en `<html>`, ver `globals.css`).
 */

const STORAGE_KEY = "pixela.modo-ligero";
const CHANGE_EVENT = "pixela:modo-ligero";

type Preference = "on" | "off" | null;

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

const connection = (): NetworkInformation | undefined =>
  typeof navigator === "undefined"
    ? undefined
    : (navigator as Navigator & { connection?: NetworkInformation }).connection;

let memoryPreference: Preference = null;

function readPreference(): Preference {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "on" || value === "off" ? value : null;
  } catch {
    return memoryPreference;
  }
}

function detectSlowNetwork(): boolean {
  const info = connection();
  if (info?.saveData) return true;
  if (info?.effectiveType && ["slow-2g", "2g", "3g"].includes(info.effectiveType)) return true;
  try {
    return window.matchMedia("(prefers-reduced-data: reduce)").matches;
  } catch {
    return false;
  }
}

function getSnapshot(): boolean {
  const preference = readPreference();
  if (preference) return preference === "on";
  return detectSlowNetwork();
}

const getServerSnapshot = () => false;

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  connection()?.addEventListener?.("change", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
    connection()?.removeEventListener?.("change", onChange);
  };
}

export function useLiteMode() {
  const lite = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLite = useCallback((next: boolean) => {
    const value: Preference = next ? "on" : "off";
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      memoryPreference = value;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { lite, setLite };
}

/** Refleja el modo en `<html class="lite">` para que el CSS pueda reaccionar. */
export function useLiteModeClass() {
  const { lite } = useLiteMode();
  useEffect(() => {
    document.documentElement.classList.toggle("lite", lite);
  }, [lite]);
}

"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FiHome, FiRefreshCw } from "react-icons/fi";
import { logger } from "@/lib/logger";
import { STYLES } from "./errors/_styles";

/**
 * Límite de error de las rutas. Sin él, cualquier excepción al renderizar
 * dejaba la pantalla de error genérica de Next. Comparte la estética de la 404.
 */
export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Error al renderizar la ruta", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className={STYLES.container} role="alert">
      <div className={STYLES.noise} aria-hidden="true" />
      <div className={STYLES.vignette} aria-hidden="true" />

      <div className={STYLES.content.wrapper}>
        <p className={STYLES.content.errorWord} aria-hidden="true">
          Corten
        </p>
        <h1 className={STYLES.content.title}>Algo ha fallado en esta toma</h1>
        <p className={STYLES.content.description}>
          No hemos podido mostrar esta página. Puedes intentarlo de nuevo o
          volver al inicio.
        </p>

        <div className={STYLES.buttons.container}>
          <button type="button" onClick={reset} className={STYLES.buttons.primary}>
            <FiRefreshCw className={STYLES.buttons.icon} aria-hidden="true" />
            Reintentar
          </button>
          <Link href="/" className={STYLES.buttons.secondary}>
            <FiHome className={STYLES.buttons.icon} aria-hidden="true" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

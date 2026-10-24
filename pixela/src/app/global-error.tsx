"use client";

import "./globals.css";
import { display, sans } from "./ui/fonts";
import { STYLES } from "./errors/_styles";

/**
 * Último recurso: se monta cuando falla el propio layout raíz, así que tiene
 * que traer su `<html>`, sus estilos y su fuente. Sin navbar ni proveedores.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="es" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-pixela-dark font-sans text-pixela-light antialiased">
        <div className={STYLES.container} role="alert">
          <div className={STYLES.content.wrapper}>
            <p className={STYLES.content.errorWord} aria-hidden="true">
              Corten
            </p>
            <h1 className={STYLES.content.title}>Pixela no ha podido arrancar</h1>
            <p className={STYLES.content.description}>
              Ha ocurrido un error inesperado. Vuelve a intentarlo en unos segundos.
            </p>
            <div className={STYLES.buttons.container}>
              <button type="button" onClick={reset} className={STYLES.buttons.primary}>
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

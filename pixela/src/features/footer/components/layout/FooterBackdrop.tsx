const STYLES = {
  text: "pointer-events-none select-none absolute inset-0 hidden md:flex items-center justify-center font-black uppercase leading-none tracking-[-0.05em] whitespace-nowrap text-transparent",
} as const;

/**
 * Fondo del footer: la palabra PIXELA a escala de pantalla, apenas encendida
 * desde abajo, y el grano de película del resto de la app.
 *
 * Sustituye a un fondo con partículas, líneas de flujo, triángulos, burbujas y
 * dos manchas difuminadas (una morada) animadas en bucle: ocho animaciones
 * infinitas al final de cada página, para un bloque que es solo enlaces.
 */
export const FooterBackdrop = () => (
  <>
    <div className="noise-effect" aria-hidden="true" />
    <span
      className={STYLES.text}
      style={{
        fontSize: "clamp(200px, 30vw, 500px)",
        backgroundImage:
          "linear-gradient(8deg, rgb(24 24 24) -50%, rgb(26 26 26) 0%, rgb(26 26 26 / 0.8) 35%, rgb(236 27 105 / 0.12) 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
      }}
      aria-hidden="true"
    >
      PIXELA
    </span>
  </>
);

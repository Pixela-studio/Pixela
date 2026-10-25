/** @type {import('tailwindcss').Config} */
// Grises cálidos (la escala stone de Tailwind) en lugar de los gray fríos.
// Copiada aquí para no usar require(), que el lint marca como error.
const WARM_GRAY = {
  50: "#fafaf9",
  100: "#f5f5f4",
  200: "#e7e5e4",
  300: "#d6d3d1",
  400: "#a8a29e",
  500: "#78716c",
  600: "#57534e",
  700: "#44403c",
  800: "#292524",
  900: "#1c1917",
  950: "#0c0a09",
};

// Los tokens y sus reglas de uso están en DESIGN.md. Si añades uno aquí,
// documéntalo allí también.
module.exports = {
  // `hover:` solo se aplica en dispositivos que pueden pasar por encima: en
  // táctil el primer toque dejaba el hover pegado hasta tocar otra cosa.
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        ipad: { raw: "(width: 768px) and (height: 1024px)" },
        "2k": { raw: "(min-width: 2048px)" },
        // Landscape horizontal en móviles pequeños (altura reducida)
        ls: { raw: "(max-height: 500px) and (orientation: landscape)" },
      },
      fontFamily: {
        // Archivo para la interfaz y el texto; Bodoni Moda para los títulos.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Didot", "Georgia", "serif"],
      },
      colors: {
        /*
         * "Fundido a negro": negros cálidos de sala y la luz marfil del
         * proyector. `white` y `gray` se sustituyen para que todo el texto
         * y los velos de la app hereden ese tono sin tocar cada clase.
         */
        white: "#F4EDE2",
        gray: WARM_GRAY,
        pixela: {
          // Planos de la sala, del más profundo al más elevado.
          ink: "#070605",
          dark: "#0D0A08",
          surface: "#17130F",
          raised: "#241E19",
          accent: "#EC1B69",
          light: "#F4EDE2",
        },
      },
      backgroundColor: {
        "dark-opacity": "rgba(13, 10, 8, 0.6)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        marquee: "marquee 50s linear infinite",
        "marquee-reverse": "marquee-reverse 50s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
    },
  },
  plugins: [],
};

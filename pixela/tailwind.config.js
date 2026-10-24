/** @type {import('tailwindcss').Config} */
// Los tokens y sus reglas de uso están en DESIGN.md. Si añades uno aquí,
// documéntalo allí también.
module.exports = {
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
        // Outfit es la única familia. `font-outfit` se mantiene como alias
        // porque lo usan decenas de componentes.
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        outfit: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      colors: {
        pixela: {
          // Planos de la sala, del más profundo al más elevado.
          ink: "#0F0F0F",
          dark: "#181818",
          surface: "#1F1F1F",
          raised: "#2A2A2A",
          accent: "#EC1B69",
          light: "#FFFFFF",
        },
      },
      backgroundColor: {
        "dark-opacity": "rgba(17, 17, 17, 0.47)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        marquee: "marquee 50s linear infinite",
        "marquee-reverse": "marquee-reverse 50s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
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

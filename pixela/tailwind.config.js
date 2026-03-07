/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/examples/**/*.{js,ts,jsx,tsx,mdx}",
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
        sans: ["var(--font-sans)"],
        outfit: ["var(--font-outfit)"],
        roboto: ["var(--font-roboto)"],
      },
      colors: {
        pixela: {
          dark: "#181818",
          accent: "#EC1B69",
          light: "#FFFFFF",
        },
      },
      backgroundColor: {
        "dark-opacity": "rgba(17, 17, 17, 0.47)",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-smooth": "float-smooth 8s ease-in-out infinite",
        marquee: "marquee 50s linear infinite",
        "marquee-reverse": "marquee-reverse 50s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "float-smooth": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
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
      fontSize: {
        "pixela-sans": {
          xs: [
            "0.75rem",
            {
              lineHeight: "1rem",
              letterSpacing: "0.05em",
              fontFamily: "var(--font-sans)",
            },
          ], // 12px
          sm: [
            "0.875rem",
            {
              lineHeight: "1.25rem",
              letterSpacing: "0.05em",
              fontFamily: "var(--font-sans)",
            },
          ], // 14px
          base: [
            "1rem",
            {
              lineHeight: "1.5rem",
              letterSpacing: "0.05em",
              fontFamily: "var(--font-sans)",
            },
          ], // 16px
          lg: [
            "1.125rem",
            {
              lineHeight: "1.75rem",
              letterSpacing: "0.05em",
              fontFamily: "var(--font-sans)",
            },
          ], // 18px
          xl: [
            "1.25rem",
            {
              lineHeight: "1.75rem",
              letterSpacing: "0.05em",
              fontFamily: "var(--font-sans)",
            },
          ], // 20px
          "2xl": [
            "1.5rem",
            {
              lineHeight: "2rem",
              letterSpacing: "0.05em",
              fontFamily: "var(--font-sans)",
            },
          ], // 24px
        },
        "pixela-outfit": {
          xs: [
            "0.75rem",
            { lineHeight: "1rem", fontFamily: "var(--font-outfit)" },
          ], // 12px
          sm: [
            "0.875rem",
            { lineHeight: "1.25rem", fontFamily: "var(--font-outfit)" },
          ], // 14px
          base: [
            "1rem",
            { lineHeight: "1.5rem", fontFamily: "var(--font-outfit)" },
          ], // 16px
          lg: [
            "1.125rem",
            { lineHeight: "1.75rem", fontFamily: "var(--font-outfit)" },
          ], // 18px
          xl: [
            "1.25rem",
            { lineHeight: "1.75rem", fontFamily: "var(--font-outfit)" },
          ], // 20px
          "2xl": [
            "1.5rem",
            { lineHeight: "2rem", fontFamily: "var(--font-outfit)" },
          ], // 24px
        },
        "pixela-roboto": {
          xs: [
            "0.75rem",
            { lineHeight: "1rem", fontFamily: "var(--font-roboto)" },
          ], // 12px
          sm: [
            "0.875rem",
            { lineHeight: "1.25rem", fontFamily: "var(--font-roboto)" },
          ], // 14px
          base: [
            "1rem",
            { lineHeight: "1.5rem", fontFamily: "var(--font-roboto)" },
          ], // 16px
          lg: [
            "1.125rem",
            { lineHeight: "1.75rem", fontFamily: "var(--font-roboto)" },
          ], // 18px
          xl: [
            "1.25rem",
            { lineHeight: "1.75rem", fontFamily: "var(--font-roboto)" },
          ], // 20px
          "2xl": [
            "1.5rem",
            { lineHeight: "2rem", fontFamily: "var(--font-roboto)" },
          ], // 24px
        },
      },
      textColor: {
        "pixela-sans-xs": "var(--font-sans)",
        "pixela-sans-sm": "var(--font-sans)",
        "pixela-sans-base": "var(--font-sans)",
        "pixela-sans-lg": "var(--font-sans)",
        "pixela-sans-xl": "var(--font-sans)",
        "pixela-sans-2xl": "var(--font-sans)",

        "pixela-outfit-xs": "var(--font-outfit)",
        "pixela-outfit-sm": "var(--font-outfit)",
        "pixela-outfit-base": "var(--font-outfit)",
        "pixela-outfit-lg": "var(--font-outfit)",
        "pixela-outfit-xl": "var(--font-outfit)",
        "pixela-outfit-2xl": "var(--font-outfit)",

        "pixela-roboto-xs": "var(--font-roboto)",
        "pixela-roboto-sm": "var(--font-roboto)",
        "pixela-roboto-base": "var(--font-roboto)",
        "pixela-roboto-lg": "var(--font-roboto)",
        "pixela-roboto-xl": "var(--font-roboto)",
        "pixela-roboto-2xl": "var(--font-roboto)",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        ".font-pixela-sans-xs": {
          fontFamily: "var(--font-sans)",
          fontSize: "0.75rem",
          lineHeight: "1rem",
          letterSpacing: "0.05em",
        },
        ".font-pixela-sans-sm": {
          fontFamily: "var(--font-sans)",
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
          letterSpacing: "0.05em",
        },
        ".font-pixela-sans-base": {
          fontFamily: "var(--font-sans)",
          fontSize: "1rem",
          lineHeight: "1.5rem",
          letterSpacing: "0.05em",
        },
        ".font-pixela-sans-lg": {
          fontFamily: "var(--font-sans)",
          fontSize: "1.125rem",
          lineHeight: "1.75rem",
          letterSpacing: "0.05em",
        },
        ".font-pixela-sans-xl": {
          fontFamily: "var(--font-sans)",
          fontSize: "1.25rem",
          lineHeight: "1.75rem",
          letterSpacing: "0.05em",
        },
        ".font-pixela-sans-2xl": {
          fontFamily: "var(--font-sans)",
          fontSize: "1.5rem",
          lineHeight: "2rem",
          letterSpacing: "0.05em",
        },

        ".font-pixela-outfit-xs": {
          fontFamily: "var(--font-outfit)",
          fontSize: "0.75rem",
          lineHeight: "1rem",
        },
        ".font-pixela-outfit-sm": {
          fontFamily: "var(--font-outfit)",
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
        },
        ".font-pixela-outfit-base": {
          fontFamily: "var(--font-outfit)",
          fontSize: "1rem",
          lineHeight: "1.5rem",
        },
        ".font-pixela-outfit-lg": {
          fontFamily: "var(--font-outfit)",
          fontSize: "1.125rem",
          lineHeight: "1.75rem",
        },
        ".font-pixela-outfit-xl": {
          fontFamily: "var(--font-outfit)",
          fontSize: "1.25rem",
          lineHeight: "1.75rem",
        },
        ".font-pixela-outfit-2xl": {
          fontFamily: "var(--font-outfit)",
          fontSize: "1.5rem",
          lineHeight: "2rem",
        },

        ".font-pixela-roboto-xs": {
          fontFamily: "var(--font-roboto)",
          fontSize: "0.75rem",
          lineHeight: "1rem",
        },
        ".font-pixela-roboto-sm": {
          fontFamily: "var(--font-roboto)",
          fontSize: "0.875rem",
          lineHeight: "1.25rem",
        },
        ".font-pixela-roboto-base": {
          fontFamily: "var(--font-roboto)",
          fontSize: "1rem",
          lineHeight: "1.5rem",
        },
        ".font-pixela-roboto-lg": {
          fontFamily: "var(--font-roboto)",
          fontSize: "1.125rem",
          lineHeight: "1.75rem",
        },
        ".font-pixela-roboto-xl": {
          fontFamily: "var(--font-roboto)",
          fontSize: "1.25rem",
          lineHeight: "1.75rem",
        },
        ".font-pixela-roboto-2xl": {
          fontFamily: "var(--font-roboto)",
          fontSize: "1.5rem",
          lineHeight: "2rem",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};

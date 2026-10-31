import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "prisma/migrations/**",
      "public/**",
    ],
  },
  {
    rules: {
      // React 19 rules from react-hooks 7 flag many legit patterns; warn only for now.
      // Address progressively — see CLAUDE.md "Known tech debt".
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/error-boundaries": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ],
    },
  },
  {
    // `next.config.js` es CommonJS (lo carga Node tal cual, sin transpilar):
    // `require` es la forma correcta ahí. Esta regla hacía que `bun run lint`
    // saliera con error aunque el resto estuviera limpio.
    files: ["next.config.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;

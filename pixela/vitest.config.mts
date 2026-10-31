import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Tests de lógica pura: validación, filtros, mapeo de TMDB, redirecciones y
 * límites. No arrancan Next ni tocan la base de datos ni la red.
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});

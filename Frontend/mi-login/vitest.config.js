import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Configuracion aislada para las pruebas del frontend.
// No cambia vite.config.js ni el build de produccion.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.test.{js,jsx,ts,tsx}"],
  },
});

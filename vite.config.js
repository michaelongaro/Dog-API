import { defineConfig } from "vite";

export default defineConfig({
  base: "/UniversalForecast/",
  assetsInclude: ["**/*.svg"],
  server: {
    port: 3000,
  },
  preview: {
    port: 8080,
  },
});

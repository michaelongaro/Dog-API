import { defineConfig } from "vite";

export default defineConfig({
  base: "/UniversalForecast/",
  server: {
    port: 3000,
  },
  preview: {
    port: 8080,
  },
});

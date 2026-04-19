import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Relativer Base-Pfad: funktioniert unter …/games/pixel-factory-vite/dist/ auf GitHub Pages. */
export default defineConfig({
  base: "./",
  /** Repo-`public/` (auth.js, …) für Dev-Server und Kopie nach `dist/`. */
  publicDir: resolve(__dirname, "../../public"),
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});

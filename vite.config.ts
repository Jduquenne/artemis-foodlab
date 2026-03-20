import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { version } from "./package.json";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  base: "/artemis-foodlab/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/react-router-dom")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/@dnd-kit")) {
            return "vendor-dnd";
          }
          if (id.includes("node_modules/dexie")) {
            return "vendor-db";
          }
          if (id.includes("src/core/data/recipes-db.json") || id.includes("src/core/data/food-db.json") || id.includes("src/core/data/assets-manifest.json")) {
            return "data";
          }
        },
      },
    },
  },
});

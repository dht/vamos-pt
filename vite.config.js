import react from "@vitejs/plugin-react";
import analyze from "rollup-plugin-analyzer";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

const ANALYZE_BUNDLE = true;

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/@babylonjs")) {
              return "babylonjs";
            }
          },
        },
      },
    },
    plugins: [
      react(),
      visualizer(),
    ],
    rollupOptions: {
      plugins: [ANALYZE_BUNDLE ? analyze() : null],
    },
    define: {},
    server: {
      host: true,
      port: 3001,
      hmr: {
        overlay: false,
      },
    },
  };
});

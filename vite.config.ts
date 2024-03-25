import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    target: ["ios12.5", "firefox115"],
  },
  plugins: [svelte()],
});

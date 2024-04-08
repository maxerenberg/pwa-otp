import { defineConfig } from "vite";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // Some PostCSS plugins (e.g. autoprefixer) use browerslist
    // See https://github.com/vitejs/vite/issues/11489
    target: browserslistToEsbuild(),
  },
  plugins: [svelte()],
});

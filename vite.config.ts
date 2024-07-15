import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // Some PostCSS plugins (e.g. autoprefixer) use browserslist
    // See https://github.com/vitejs/vite/issues/11489
    target: browserslistToEsbuild(),
  },
  plugins: [
    svelte(),
    svelteTesting(),
    VitePWA({
      injectRegister: "inline",
      workbox: {
        // Make sure these patterns do not overlap with the files in includeAssets
        // or else they will get included twice in sw.js
        globPatterns: [
          "**/*.{js,css,html}",
          // Currently, all of our SVG assets are below the default assetsInlineLimit
          // of 4 KiB (https://vitejs.dev/config/build-options#build-assetsinlinelimit)
          //"assets/*.svg"
        ],
      },
      includeAssets: ["favicon.ico", "favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "PWA OTP",
        short_name: "PWA OTP",
        description: "Easily manage your TOTP codes",
        // TODO: background_color
        theme_color: "#0369a1",
        icons: [
          {
            src: "android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest-setup.js"],
  },
});

import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import browserslistToEsbuild from "browserslist-to-esbuild";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    // Some PostCSS plugins (e.g. autoprefixer) use browserslist
    // See https://github.com/vitejs/vite/issues/11489
    target: browserslistToEsbuild(),
  },
  plugins: [
    svelte(),
    VitePWA({
      injectRegister: "inline",
      workbox: {
        // This is causing the icons to get included twice in sw.js (overlap with includeAssets?)
        // TODO: include all icons under src/assets
        //globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
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
});

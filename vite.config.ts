import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/dance/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "Dance — carnet",
        short_name: "Dance",
        description: "Carnet de cours : emploi du temps, figures, étoiles et contrôles.",
        theme_color: "#2a1420",
        background_color: "#f6efe6",
        display: "standalone",
        lang: "fr",
        start_url: "/dance/",
        scope: "/dance/",
        icons: [
          { src: "/dance/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/dance/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/dance/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/dance/index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}"],
      },
    }),
  ],
});

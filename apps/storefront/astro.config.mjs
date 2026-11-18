import { defineConfig } from "astro/config";

export default defineConfig({
  // Set this to the live domain before launch (jayishasaree.com / .in).
  site: "https://www.jayishasaree.com",
  output: "static",
  build: { inlineStylesheets: "auto" },
  devToolbar: { enabled: false },
  vite: {
    build: {
      // The hero video is served from /public untouched; keep assets predictable.
      assetsInlineLimit: 2048,
    },
  },
});

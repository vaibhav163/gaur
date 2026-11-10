import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA build. All files under public/ (assets, sitemap.xml,
// robots.txt) are copied to dist/ unchanged.
export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist" },
});

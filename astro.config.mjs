import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

export default defineConfig({
  // www is the canonical host; the apex domain 308-redirects to it.
  site: "https://www.devtools.fm",
  output: "server",
  adapter: vercel(),
  integrations: [react()],
  vite: {
    build: {
      sourcemap: true,
    },
    plugins: [tailwindcss()],
  },
});

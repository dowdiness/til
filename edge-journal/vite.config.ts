import { cloudflare } from "@cloudflare/vite-plugin";
import { astryxStylex, LIGHTNINGCSS_TARGETS } from "@astryxdesign/build/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { inertiaPages } from "@hono/inertia/vite";
import ssrPlugin from "vite-ssr-components/plugin";

// Cloudflare owns SSR environments; Astryx's config plugin already supplies the required aliases/excludes.
const astryxPlugins = astryxStylex({ lightningcssTargets: LIGHTNINGCSS_TARGETS }).map((plugin) =>
  plugin.name === "@stylexjs/unplugin" ? { ...plugin, config: undefined } : plugin,
);

export default defineConfig(({ command }) => ({
  plugins: [
    inertiaPages(),
    ...(command === "build" ? astryxPlugins : []),
    cloudflare(),
    ssrPlugin(),
    react(),
  ],
  build: { target: "es2022" },
}));

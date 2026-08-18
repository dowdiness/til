import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { astryxStylex, LIGHTNINGCSS_TARGETS } from "@astryxdesign/build/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import { inertiaPages } from "@hono/inertia/vite";
import ssrPlugin from "vite-ssr-components/plugin";

function createAstryxPlugins(command: "build" | "serve") {
  const sourceBuild = command === "build";

  return astryxStylex({
    dev: !sourceBuild,
    lightningcssTargets: LIGHTNINGCSS_TARGETS,
  })
    .filter((plugin) => sourceBuild || plugin.name !== "astryx-config")
    .map((plugin) =>
      plugin.name === "@stylexjs/unplugin" ? { ...plugin, config: undefined } : plugin,
    );
}

export default defineConfig(({ command }) => ({
  plugins: [
    inertiaPages(),
    tailwindcss(),
    ...createAstryxPlugins(command),
    cloudflare(),
    ssrPlugin(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: { target: "es2022" },
}));

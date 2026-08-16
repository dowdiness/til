import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

const migrations = await readD1Migrations(new URL("./drizzle/migrations", import.meta.url).pathname);

export default defineConfig({
  plugins: [cloudflareTest({
    wrangler: { configPath: "./wrangler.jsonc" },
    miniflare: {
      compatibilityFlags: ["nodejs_compat"],
      bindings: {
        ADMIN_USERNAME: "admin",
        ADMIN_PASSWORD: "password",
        COOKIE_SECRET: "test-cookie-secret-at-least-32-bytes",
        TEST_MIGRATIONS: migrations,
      },
    },
  })],
  test: {
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    pool: "cloudflare-pool",
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 15000,
  },
});

import { beforeEach } from "vitest";
import { applyD1Migrations, env } from "cloudflare:test";

beforeEach(async () => {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
  const insert = env.DB.prepare("INSERT OR IGNORE INTO posts (title, slug, excerpt, body, status, published_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  await insert.bind("Published one", "published-one", "First searchable excerpt", "Published body one", "published", 1704067200000, 1704067200000, 1704067200000).run();
  await insert.bind("Published two", "published-two", "Second searchable excerpt", "Published body two", "published", 1704153600000, 1704153600000, 1704153600000).run();
  await insert.bind("Draft only", "draft-only", "Draft excerpt", "Draft body", "draft", null, 1704240000000, 1704240000000).run();
});

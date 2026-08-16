import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
    publishedAt: integer("published_at", { mode: "number" }),
    createdAt: integer("created_at", { mode: "number" }).notNull(),
    updatedAt: integer("updated_at", { mode: "number" }).notNull(),
    deletedAt: integer("deleted_at", { mode: "number" }),
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
    index("posts_published_listing_idx").on(table.status, table.publishedAt),
    index("posts_active_published_listing_idx").on(table.deletedAt, table.status, table.publishedAt),
    index("posts_admin_listing_idx").on(table.deletedAt, table.updatedAt),
    check("posts_status_check", sql`${table.status} in ('draft', 'published')`),
  ],
);

export type PostRow = typeof posts.$inferSelect;
export type NewPostRow = typeof posts.$inferInsert;

import { and, desc, eq, isNotNull, isNull, like, or, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { AdminPost, AdminPostSummary, DeletedPostSummary, PostInput, PostStatus, PublicPost, PublicPostSummary } from "../domain/post";
import { publicationTimestamp } from "../domain/post";
import { posts, type PostRow } from "./schema";
import { dbFor } from "./client";

export type PageResult<T> = Readonly<{
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  pageCount: number;
}>;

export type CreatePostResult =
  | Readonly<{ kind: "ok"; post: AdminPost }>
  | Readonly<{ kind: "slug-conflict" }>;

export type UpdatePostResult =
  | CreatePostResult
  | Readonly<{ kind: "not-found" }>;

function iso(value: number): string {
  return new Date(value).toISOString();
}

function publishedIso(value: number | null): string {
  if (value === null) throw new Error("Published post has no publication timestamp");
  return iso(value);
}

function toPublicSummary(row: PostRow): PublicPostSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    publishedAt: publishedIso(row.publishedAt),
  };
}

function toPublicPost(row: PostRow): PublicPost {
  return { ...toPublicSummary(row), body: row.body };
}

function toAdminSummary(row: PostRow): AdminPostSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    status: row.status,
    updatedAt: iso(row.updatedAt),
  };
}

function toAdminPost(row: PostRow): AdminPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    status: row.status,
    publishedAt: row.publishedAt === null ? null : iso(row.publishedAt),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

function isSlugConflict(error: unknown): boolean {
  let current = error;
  while (current instanceof Error) {
    if (current.message.includes("UNIQUE constraint failed: posts.slug") || current.message.includes("posts_slug_unique")) return true;
    current = current.cause;
  }
  return false;
}

export async function listPublished(db: D1Database, page: number, query: string): Promise<PageResult<PublicPostSummary>> {
  const database = dbFor(db);
  const pageSize = 6;
  const search = query.trim();
  const filter = search
    ? and(isNull(posts.deletedAt), eq(posts.status, "published"), or(like(posts.title, `%${search}%`), like(posts.excerpt, `%${search}%`)))
    : and(isNull(posts.deletedAt), eq(posts.status, "published"));
  const count = await database.select({ count: sql<number>`count(*)` }).from(posts).where(filter);
  const total = count[0]?.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const rows = await database
    .select()
    .from(posts)
    .where(filter)
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(pageSize)
    .offset((currentPage - 1) * pageSize);
  return { items: rows.map(toPublicSummary), page: currentPage, pageSize, total, pageCount };
}

export async function findPublishedBySlug(db: D1Database, slug: string): Promise<PublicPost | null> {
  const rows = await dbFor(db).select().from(posts).where(and(eq(posts.slug, slug), eq(posts.status, "published"), isNull(posts.deletedAt))).limit(1);
  return rows[0] ? toPublicPost(rows[0]) : null;
}

export async function listAdmin(db: D1Database, query = "", status?: PostStatus): Promise<AdminPostSummary[]> {
  const filters: SQL[] = [isNull(posts.deletedAt)];
  const search = query.trim();
  if (search) {
    const searchFilter = or(
      like(posts.title, `%${search}%`),
      like(posts.slug, `%${search}%`),
      like(posts.excerpt, `%${search}%`),
    );
    if (searchFilter) filters.push(searchFilter);
  }
  if (status) filters.push(eq(posts.status, status));
  const filter = filters.length > 0 ? and(...filters) : undefined;
  const rows = await dbFor(db).select().from(posts).where(filter).orderBy(desc(posts.updatedAt), desc(posts.id));
  return rows.map(toAdminSummary);
}

export async function findPost(db: D1Database, id: number): Promise<AdminPost | null> {
  const rows = await dbFor(db).select().from(posts).where(and(eq(posts.id, id), isNull(posts.deletedAt))).limit(1);
  return rows[0] ? toAdminPost(rows[0]) : null;
}

export async function createPost(db: D1Database, input: PostInput, now: number): Promise<CreatePostResult> {
  try {
    const publishedAt = publicationTimestamp(null, input.status, null, now);
    const result = await dbFor(db).insert(posts).values({ ...input, publishedAt, createdAt: now, updatedAt: now }).returning();
    return { kind: "ok", post: toAdminPost(result[0]) };
  } catch (error) {
    if (isSlugConflict(error)) return { kind: "slug-conflict" };
    throw error;
  }
}

export async function updatePost(db: D1Database, id: number, input: PostInput, now: number, previous: AdminPost): Promise<UpdatePostResult> {
  try {
    const publishedAt = publicationTimestamp(
      previous.status,
      input.status,
      previous.publishedAt === null ? null : Date.parse(previous.publishedAt),
      now,
    );
    const result = await dbFor(db)
      .update(posts)
      .set({ ...input, publishedAt, updatedAt: now })
      .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
      .returning();
    const row = result[0];
    return row ? { kind: "ok", post: toAdminPost(row) } : { kind: "not-found" };
  } catch (error) {
    if (isSlugConflict(error)) return { kind: "slug-conflict" };
    throw error;
  }
}

export async function deletePost(db: D1Database, id: number, now: number): Promise<DeletedPostSummary | null> {
  const result = await dbFor(db)
    .update(posts)
    .set({ deletedAt: now })
    .where(and(eq(posts.id, id), isNull(posts.deletedAt)))
    .returning({ id: posts.id, title: posts.title });
  return result[0] ?? null;
}

export async function findDeletedPost(db: D1Database, id: number): Promise<DeletedPostSummary | null> {
  const rows = await dbFor(db)
    .select({ id: posts.id, title: posts.title })
    .from(posts)
    .where(and(eq(posts.id, id), isNotNull(posts.deletedAt)))
    .limit(1);
  return rows[0] ?? null;
}

export async function restorePost(db: D1Database, id: number): Promise<DeletedPostSummary | null> {
  const result = await dbFor(db)
    .update(posts)
    .set({ deletedAt: null })
    .where(and(eq(posts.id, id), isNotNull(posts.deletedAt)))
    .returning({ id: posts.id, title: posts.title });
  return result[0] ?? null;
}

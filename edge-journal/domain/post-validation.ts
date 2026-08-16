import * as v from "valibot";
import type { PostInput, PostStatus } from "./post";

const postSchema = v.object({
  title: v.pipe(
    v.string(),
    v.minLength(1, "Title is required."),
    v.maxLength(120, "Title must be 120 characters or fewer."),
  ),
  slug: v.pipe(
    v.string(),
    v.minLength(1, "Slug is required."),
    v.maxLength(100, "Slug must be 100 characters or fewer."),
    v.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and single hyphens only."),
  ),
  excerpt: v.pipe(
    v.string(),
    v.minLength(1, "Excerpt is required."),
    v.maxLength(300, "Excerpt must be 300 characters or fewer."),
  ),
  body: v.pipe(
    v.string(),
    v.minLength(1, "Body is required."),
    v.maxLength(50000, "Body must be 50,000 characters or fewer."),
  ),
  status: v.picklist(["draft", "published"], "Choose draft or published."),
});

export type FieldErrors = Record<string, string>;

export function validatePostInput(input: unknown): { ok: true; value: PostInput } | { ok: false; errors: FieldErrors } {
  const result = v.safeParse(postSchema, input);
  if (result.success) return { ok: true, value: { title: result.output.title, slug: result.output.slug, excerpt: result.output.excerpt, body: result.output.body, status: result.output.status } };
  const errors: FieldErrors = {};
  for (const issue of result.issues) {
    const key = issue.path?.[0]?.key;
    if (typeof key === "string" && errors[key] === undefined) errors[key] = issue.message;
  }
  return { ok: false, errors };
}

export function isPostStatus(value: string): value is PostStatus {
  return value === "draft" || value === "published";
}

import { describe, expect, it } from "vitest";
import { publicationTimestamp } from "../domain/post";
import { validatePostInput } from "../domain/post-validation";

describe("publicationTimestamp", () => {
  const now = 1_720_000_000_000;
  const original = 1_710_000_000_000;

  it("centralizes every publication transition", () => {
    expect(publicationTimestamp(null, "draft", null, now)).toBeNull();
    expect(publicationTimestamp(null, "published", null, now)).toBe(now);
    expect(publicationTimestamp("draft", "published", null, now)).toBe(now);
    expect(publicationTimestamp("published", "draft", original, now)).toBeNull();
    expect(publicationTimestamp("published", "published", original, now)).toBe(original);
  });
});

describe("validatePostInput", () => {
  it("returns field-specific errors for shared client and server validation", () => {
    const result = validatePostInput({
      title: "",
      slug: "Bad Slug",
      excerpt: "",
      body: "",
      status: "draft",
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errors).toMatchObject({
      title: "Title is required.",
      slug: "Use lowercase letters, numbers, and single hyphens only.",
      excerpt: "Excerpt is required.",
      body: "Body is required.",
    });
  });
});

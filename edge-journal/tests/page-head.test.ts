import { describe, expect, it } from "vitest";
import { JOURNAL_DESCRIPTION, resolvePageHead, resolvePageMetadata } from "../lib/page-head";
import { publishedDate } from "../lib/published-date";

describe("publishedDate", () => {
  it("uses one timezone on the Worker and in the browser for hydration", () => {
    const value = "2026-08-14T23:30:00.000Z";
    expect(publishedDate(value, "short")).toBe("Aug 15, 2026");
    expect(publishedDate(value, "long")).toBe("August 15, 2026");
  });
});

describe("page metadata", () => {
  it("describes the public journal in the initial document", () => {
    const page = { component: "Posts/Index", props: {} };

    expect(resolvePageMetadata(page)).toEqual({
      title: "Journal",
      description: JOURNAL_DESCRIPTION,
    });
    expect(resolvePageHead(page)).toContain(
      `<meta name="description" content="${JOURNAL_DESCRIPTION}" data-inertia="description">`,
    );
  });

  it("uses article metadata without allowing markup into the server head", () => {
    const page = {
      component: "Posts/Show",
      props: { post: { title: "A <quiet> & useful note", excerpt: `Read "this" first.` } },
    };

    expect(resolvePageHead(page)).toEqual([
      '<title data-inertia="">A &lt;quiet&gt; &amp; useful note</title>',
      '<meta name="description" content="Read &quot;this&quot; first." data-inertia="description">',
    ]);
  });

  it("keeps authenticated and error pages out of search indexes", () => {
    expect(resolvePageMetadata({ component: "Admin/Posts/Index", props: {} }).robots)
      .toBe("noindex, nofollow");
    expect(resolvePageMetadata({ component: "Errors/NotFound", props: {} }).robots)
      .toBe("noindex, nofollow");
  });
});

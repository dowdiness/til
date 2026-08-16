import { SELF, env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import { APP_VERSION } from "../lib/app-version";
import { deletePost, findPost, restorePost, updatePost } from "../db/posts";

const auth = `Basic ${btoa("admin:password")}`;

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  return SELF.fetch(`https://edge-journal.test${path}`, { redirect: "manual", ...init });
}

async function inertiaGet(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "text/html, application/xhtml+xml");
  headers.set("X-Inertia", "true");
  headers.set("X-Inertia-Version", APP_VERSION);
  return request(path, { ...init, headers });
}

type InertiaPage = {
  component: string;
  props: {
    errors: Record<string, string>;
    flash: string | null;
    posts?: { items: { slug: string }[] };
    undo?: { id: number; title: string } | null;
  };
};

async function page(response: Response): Promise<InertiaPage> {
  return await response.json<InertiaPage>();
}

function form(values: Record<string, string>): URLSearchParams {
  return new URLSearchParams(values);
}

function adminMutation(method: "POST" | "PATCH" | "DELETE", body?: BodyInit): RequestInit {
  return {
    method,
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://edge-journal.test",
      "Sec-Fetch-Site": "same-origin",
    },
    body,
  };
}

function cookieFrom(response: Response): string {
  return response.headers.get("Set-Cookie")?.split(";", 1)[0] ?? "";
}

async function postCount(): Promise<number> {
  return (await env.DB.prepare("SELECT count(*) AS count FROM posts").first<{ count: number }>())?.count ?? 0;
}

const valid = {
  title: "A valid post",
  slug: "a-valid-post",
  excerpt: "An excerpt",
  body: "A body",
  status: "draft",
} as const;

describe("Edge Journal integration", () => {
  it("server-renders the public journal with its embedded Inertia page object", async () => {
    const response = await request("/");
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('data-page="app"');
    expect(html).toContain('data-server-rendered="true"');
    expect(html).toContain('"component":"Posts\\/Index"');
    expect(html).toContain("Published notes");
    expect(html).toContain('role="status" aria-live="polite" aria-atomic="true"');
    expect(html).toContain("Published one");
    expect(html).toContain('<title data-inertia="">Journal</title>');
  });

  it("server-renders published article content", async () => {
    const response = await request("/posts/published-one");
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain('data-server-rendered="true"');
    expect(html).toContain("Published one");
    expect(html).toContain("Published body one");
    expect(html).toContain('<title data-inertia="">Published one</title>');
  });

  it("keeps concurrent public SSR responses isolated", async () => {
    const paths = Array.from({ length: 8 }, (_, index) =>
      index % 2 === 0 ? "/" : "/posts/published-one"
    );
    const responses = await Promise.all(paths.map((path) => request(path)));
    const documents = await Promise.all(responses.map((response) => response.text()));

    documents.forEach((html, index) => {
      const expectedTitle = index % 2 === 0 ? "Journal" : "Published one";
      expect(html).toContain(`<title data-inertia="">${expectedTitle}</title>`);
      expect(html).toContain('data-server-rendered="true"');
    });
  });

  it("serves the Inertia page object and protocol header", async () => {
    const response = await inertiaGet("/");

    expect(response.status).toBe(200);
    expect(response.headers.get("X-Inertia")).toBe("true");
    expect((await page(response)).component).toBe("Posts/Index");
  });

  it("shows only published posts and returns 404 for a draft URL", async () => {
    const listing = await page(await inertiaGet("/"));
    expect(listing.props.posts?.items.map((post) => post.slug)).not.toContain("draft-only");

    const draft = await request("/posts/draft-only");
    expect(draft.status).toBe(404);
    expect(draft.headers.get("Content-Type")).toContain("text/html");
  });

  it("supports partial reloads for public search", async () => {
    const response = await inertiaGet("/?q=Second", {
      headers: {
        "X-Inertia-Partial-Component": "Posts/Index",
        "X-Inertia-Partial-Data": "posts,query,errors,flash",
      },
    });
    const result = await response.json<{
      props: {
        posts: { items: { slug: string }[] };
        query: string;
        errors: Record<string, string>;
        flash: string | null;
      };
    }>();

    expect(Object.keys(result.props).sort()).toEqual(["errors", "flash", "posts", "query"]);
    expect(result.props.query).toBe("Second");
    expect(result.props.posts.items.map((post) => post.slug)).toEqual(["published-two"]);
  });

  it("clamps out-of-range public pages to the final available page", async () => {
    const response = await inertiaGet("/?page=999");
    const result = await response.json<{
      props: { posts: { page: number; pageCount: number; items: { slug: string }[] } };
    }>();

    expect(result.props.posts.page).toBe(result.props.posts.pageCount);
    expect(result.props.posts.items.length).toBeGreaterThan(0);
  });

  it("preserves the Inertia protocol and JSON MIME type for unmatched routes", async () => {
    const missing = await inertiaGet("/not-a-route");

    expect(missing.status).toBe(404);
    expect(missing.headers.get("X-Inertia")).toBe("true");
    expect(missing.headers.get("Content-Type")).toContain("application/json");
    expect((await page(missing)).component).toBe("Errors/NotFound");
  });

  it("requires Basic Auth and keeps the authenticated admin on the CSR shell", async () => {
    expect((await request("/admin/posts")).status).toBe(401);

    const response = await request("/admin/posts", { headers: { Authorization: auth } });
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(html).toContain('data-page="app"');
    expect(html).not.toContain('data-server-rendered="true"');
  });

  it("filters the admin list by query and status", async () => {
    const response = await inertiaGet("/admin/posts?q=draft&status=draft", {
      headers: { Authorization: auth },
    });
    const result = await response.json<{
      props: {
        posts: { slug: string; status: string }[];
        query: string;
        status: string;
      };
    }>();

    expect(result.props.query).toBe("draft");
    expect(result.props.status).toBe("draft");
    expect(result.props.posts).toEqual([
      expect.objectContaining({ slug: "draft-only", status: "draft" }),
    ]);
  });

  it("rejects cross-origin JSON mutations that are outside Hono CSRF's form content types", async () => {
    const response = await request("/admin/posts", {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
        Origin: "https://attacker.example",
        "Sec-Fetch-Site": "cross-site",
      },
      body: JSON.stringify(valid),
    });

    expect(response.status).toBe(403);
  });

  it("creates a valid post with 303 and rejects invalid input without inserting", async () => {
    const before = await postCount();
    const created = await request("/admin/posts", adminMutation("POST", form(valid)));

    expect(created.status).toBe(303);
    expect(await postCount()).toBe(before + 1);

    const invalid = await request(
      "/admin/posts",
      adminMutation("POST", form({ ...valid, slug: "Bad Slug", title: "" })),
    );
    expect(invalid.status).toBe(303);
    expect(await postCount()).toBe(before + 1);
  });

  it("redirects field errors, expires their cookie, and does not show them again", async () => {
    const invalid = await request(
      "/admin/posts",
      adminMutation("POST", form({ ...valid, slug: "field-error", title: "" })),
    );
    const location = invalid.headers.get("Location") ?? "/admin/posts/new";
    const cookie = cookieFrom(invalid);

    expect(invalid.status).toBe(303);
    expect(location).toBe("/admin/posts/new");

    const first = await inertiaGet(location, { headers: { Authorization: auth, Cookie: cookie } });
    expect((await page(first)).props.errors.title).toBeTruthy();
    expect(first.headers.get("Set-Cookie")).toContain("Max-Age=0");

    const second = await inertiaGet(location, { headers: { Authorization: auth } });
    expect((await page(second)).props.errors).toEqual({});
  });

  it("converts the database unique constraint into a slug field error", async () => {
    const duplicate = await request(
      "/admin/posts",
      adminMutation("POST", form({ ...valid, slug: "published-one" })),
    );
    expect(duplicate.status).toBe(303);

    const errorsPage = await inertiaGet("/admin/posts/new", {
      headers: { Authorization: auth, Cookie: cookieFrom(duplicate) },
    });
    expect((await page(errorsPage)).props.errors.slug).toContain("already");
  });

  it("updates a draft, assigns its publication time, soft-deletes it, and restores it", async () => {
    const created = await request(
      "/admin/posts",
      adminMutation("POST", form({ ...valid, slug: "update-me" })),
    );
    expect(created.status).toBe(303);

    const row = await env.DB.prepare("SELECT id, published_at FROM posts WHERE slug = ?")
      .bind("update-me")
      .first<{ id: number; published_at: number | null }>();
    expect(row?.published_at).toBeNull();

    const updated = await request(
      `/admin/posts/${row?.id ?? 0}`,
      adminMutation("PATCH", form({ ...valid, slug: "updated-slug", status: "published" })),
    );
    expect(updated.status).toBe(303);

    const published = await env.DB.prepare("SELECT published_at FROM posts WHERE id = ?")
      .bind(row?.id)
      .first<{ published_at: number | null }>();
    expect(published?.published_at).not.toBeNull();

    const deleted = await request(`/admin/posts/${row?.id ?? 0}`, adminMutation("DELETE"));
    expect(deleted.status).toBe(303);
    expect(deleted.headers.get("Location")).toBe(`/admin/posts?undo=${row?.id ?? 0}`);
    expect((await request("/posts/updated-slug")).status).toBe(404);

    const deletedRow = await env.DB.prepare("SELECT deleted_at FROM posts WHERE id = ?")
      .bind(row?.id)
      .first<{ deleted_at: number | null }>();
    expect(deletedRow?.deleted_at).not.toBeNull();

    const undoPage = await inertiaGet(deleted.headers.get("Location") ?? "/admin/posts", {
      headers: { Authorization: auth },
    });
    const undoResult = await undoPage.json<{
      props: { posts: { slug: string }[]; undo: { id: number; title: string } | null };
    }>();
    expect(undoResult.props.undo).toEqual({ id: row?.id, title: valid.title });
    expect(undoResult.props.posts.map((post) => post.slug)).not.toContain("updated-slug");

    const restored = await request(`/admin/posts/${row?.id ?? 0}/restore`, adminMutation("POST"));
    expect(restored.status).toBe(303);
    expect((await request("/posts/updated-slug")).status).toBe(200);

    const previous = await findPost(env.DB, row?.id ?? 0);
    if (!previous) throw new Error("Expected restored post");
    await deletePost(env.DB, previous.id, Date.now());
    const racedUpdate = await updatePost(env.DB, previous.id, valid, Date.now(), previous);
    expect(racedUpdate.kind).toBe("not-found");
    await restorePost(env.DB, previous.id);
  });

  it("shows success once and returns 404 for missing admin resources", async () => {
    expect((await request("/admin/posts/99999", adminMutation("DELETE"))).status).toBe(404);
    expect((await request("/admin/posts/99999/restore", adminMutation("POST"))).status).toBe(404);
    expect((await request("/admin/posts/99999/edit", { headers: { Authorization: auth } })).status).toBe(404);

    const created = await request(
      "/admin/posts",
      adminMutation("POST", form({ ...valid, slug: "success-once" })),
    );
    const first = await inertiaGet("/admin/posts", {
      headers: { Authorization: auth, Cookie: cookieFrom(created) },
    });
    expect((await page(first)).props.flash).toBe("Post created.");
    expect(first.headers.get("Set-Cookie")).toContain("Max-Age=0");

    const second = await inertiaGet("/admin/posts", { headers: { Authorization: auth } });
    expect((await page(second)).props.flash).toBeNull();
  });
});

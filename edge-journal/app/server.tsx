import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import { basicAuth } from "hono/basic-auth";
import { csrf } from "hono/csrf";
import { logger } from "hono/logger";
import { requestId as honoRequestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { inertia } from "@hono/inertia";
import "./pages.gen";
import { listAdmin, listPublished, findPost, findPublishedBySlug, createPost, updatePost, deletePost, findDeletedPost, restorePost } from "../db/posts";
import { validatePostInput, type FieldErrors } from "../domain/post-validation";
import type { PostInput } from "../domain/post";
import { rootView } from "./root-view";
import { APP_VERSION } from "../lib/app-version";
import { renderPage } from "../lib/inertia-render";
import { noticeRedirect } from "../lib/redirect";
import { sameOriginMutation } from "../lib/request";
import { NotFoundError } from "../lib/errors";
import { loadAdminSearchParams, loadPublicSearchParams } from "../lib/search-params";
import { contentSecurityPolicy, requestNonce } from "../lib/security-policy";

type AppEnv = { Bindings: CloudflareBindings; Variables: { requestId: string; nonce: string } };
const app = new Hono<AppEnv>();

app.use("*", honoRequestId());
app.use("*", async (c, next) => {
  c.set("nonce", requestNonce());
  await next();
  c.res.headers.set("Content-Security-Policy", contentSecurityPolicy({ nonce: c.get("nonce"), development: import.meta.env.MODE === "development" }));
});
app.use("*", secureHeaders());
app.use("*", (c, next) => import.meta.env.DEV ? logger()(c, next) : next());
app.use("*", inertia({ version: APP_VERSION, rootView }));
app.use("*", csrf());
app.use("*", sameOriginMutation);

const adminNoCache: MiddlewareHandler<AppEnv> = async (c, next) => {
  await next();
  c.res.headers.set("Cache-Control", "private, no-store, max-age=0");
  c.res.headers.set("Pragma", "no-cache");
  c.res.headers.set("Expires", "0");
};
app.use("/admin", adminNoCache);
app.use("/admin/*", adminNoCache);

const adminAuth: MiddlewareHandler<AppEnv> = (c, next) =>
  basicAuth({
    realm: "Edge Journal admin",
    username: c.env.ADMIN_USERNAME,
    password: c.env.ADMIN_PASSWORD,
  })(c, next);
app.use("/admin", adminAuth);
app.use("/admin/*", adminAuth);

function secret(c: { env: CloudflareBindings }): string { return c.env.COOKIE_SECRET; }
function audit(c: { get(key: "requestId"): string | undefined }, event: string, postId: number): void {
  console.log(JSON.stringify({ level: "info", event, requestId: c.get("requestId") ?? "unknown", postId }));
}
function numberParam(value: string): number | null { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : null; }
function withStatus(response: Response, status: number): Response { return new Response(response.body, { status, headers: response.headers }); }

async function readInput(c: { req: { header(name: string): string | undefined; parseBody(): Promise<Record<string, string | File | string[]>>; json<T>(): Promise<T> } }): Promise<Record<string, unknown>> {
  const contentType = c.req.header("Content-Type") ?? "";
  if (contentType.includes("application/json")) return await c.req.json<Record<string, unknown>>();
  const body = await c.req.parseBody();
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) result[key] = Array.isArray(value) ? value[0] : value;
  return result;
}
function initialPost(): PostInput { return { title: "", slug: "", excerpt: "", body: "", status: "draft" }; }
async function validatedInput(c: Parameters<typeof readInput>[0]): Promise<{ value: PostInput } | { errors: FieldErrors }> {
  const result = validatePostInput(await readInput(c));
  return result.ok ? { value: result.value } : { errors: result.errors };
}

const routes = app.get("/", async (c) => {
  const search = loadPublicSearchParams(c.req.raw);
  const pageValue = search.page > 0 ? search.page : 1;
  const posts = await listPublished(c.env.DB, pageValue, search.q);
  return renderPage(c, secret(c), "Posts/Index", { posts, query: search.q });
})
.get("/posts/:slug", async (c) => {
  const post = await findPublishedBySlug(c.env.DB, c.req.param("slug"));
  if (!post) throw new NotFoundError();
  return renderPage(c, secret(c), "Posts/Show", { post });
})

.get("/admin", (c) => c.redirect("/admin/posts", 303))
.get("/admin/posts", async (c) => {
  const search = loadAdminSearchParams(c.req.raw);
  const undoId = numberParam(c.req.query("undo") ?? "");
  const [posts, undo] = await Promise.all([
    listAdmin(c.env.DB, search.q, search.status === "all" ? undefined : search.status),
    undoId === null ? Promise.resolve(null) : findDeletedPost(c.env.DB, undoId),
  ]);
  return renderPage(c, secret(c), "Admin/Posts/Index", {
    posts,
    query: search.q,
    status: search.status,
    undo,
  });
})
.get("/admin/posts/new", async (c) => renderPage(c, secret(c), "Admin/Posts/New", { initial: initialPost() }))
.get("/admin/posts/:id/edit", async (c) => {
  const id = numberParam(c.req.param("id"));
  const post = id === null ? null : await findPost(c.env.DB, id);
  if (!post) throw new NotFoundError();
  return renderPage(c, secret(c), "Admin/Posts/Edit", { post });
})
.post("/admin/posts", async (c) => {
  const input = await validatedInput(c);
  if ("errors" in input) return noticeRedirect(c, secret(c), "/admin/posts/new", { errors: input.errors });
  const result = await createPost(c.env.DB, input.value, Date.now());
  if (result.kind === "slug-conflict") {
    return noticeRedirect(c, secret(c), "/admin/posts/new", { errors: { slug: "This slug is already in use." } });
  }
  audit(c, "admin.post.created", result.post.id);
  return noticeRedirect(c, secret(c), "/admin/posts", { flash: "Post created." });
})
.patch("/admin/posts/:id", async (c) => {
  const id = numberParam(c.req.param("id"));
  const previous = id === null ? null : await findPost(c.env.DB, id);
  if (!previous || id === null) throw new NotFoundError();
  const input = await validatedInput(c);
  if ("errors" in input) return noticeRedirect(c, secret(c), `/admin/posts/${id}/edit`, { errors: input.errors });
  const result = await updatePost(c.env.DB, id, input.value, Date.now(), previous);
  if (result.kind === "not-found") throw new NotFoundError();
  if (result.kind === "slug-conflict") {
    return noticeRedirect(c, secret(c), `/admin/posts/${id}/edit`, { errors: { slug: "This slug is already in use." } });
  }
  audit(c, "admin.post.updated", result.post.id);
  return noticeRedirect(c, secret(c), "/admin/posts", { flash: "Post updated." });
})
.delete("/admin/posts/:id", async (c) => {
  const id = numberParam(c.req.param("id"));
  const deleted = id === null ? null : await deletePost(c.env.DB, id, Date.now());
  if (!deleted) throw new NotFoundError();
  audit(c, "admin.post.deleted", deleted.id);
  return c.redirect(`/admin/posts?undo=${deleted.id}`, 303);
})
.post("/admin/posts/:id/restore", async (c) => {
  const id = numberParam(c.req.param("id"));
  const restored = id === null ? null : await restorePost(c.env.DB, id);
  if (!restored) throw new NotFoundError();
  audit(c, "admin.post.restored", restored.id);
  return noticeRedirect(c, secret(c), "/admin/posts", { flash: `“${restored.title}” restored.` });
});

app.notFound(async (c) => {
  const response = await renderPage(c, secret(c), "Errors/NotFound", {});
  const notFound = c.text(await response.text(), 404);
  for (const [name, value] of response.headers) notFound.headers.set(name, value);
  return notFound;
});
app.onError(async (error, c) => {
  if (error instanceof HTTPException) return error.getResponse();
  const request = c.get("requestId") ?? "unknown";
  if (error instanceof NotFoundError) {
    const response = await renderPage(c, secret(c), "Errors/NotFound", {});
    return withStatus(response, 404);
  }
  console.error(JSON.stringify({ level: "error", requestId: request, error: error instanceof Error ? error.name : "unknown" }));
  const response = await renderPage(c, secret(c), "Errors/InternalServerError", {});
  return withStatus(response, 500);
});

export default routes;

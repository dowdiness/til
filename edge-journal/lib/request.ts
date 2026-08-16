import type { MiddlewareHandler } from "hono";

export const sameOriginMutation: MiddlewareHandler = async (c, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(c.req.method)) return next();
  const origin = c.req.header("Origin");
  const site = c.req.header("Sec-Fetch-Site");
  const requestOrigin = new URL(c.req.url).origin;
  if ((origin !== undefined && origin !== requestOrigin) || (site !== undefined && !["same-origin", "none"].includes(site))) return c.text("Forbidden", 403);
  return next();
};

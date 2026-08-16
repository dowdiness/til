import type { Context } from "hono";
import { setNotice, type Notice } from "./transient-cookie";

export async function noticeRedirect(c: Context, secret: string, location: string, notice: Notice): Promise<Response> {
  await setNotice(c, secret, notice);
  return c.redirect(location, 303);
}

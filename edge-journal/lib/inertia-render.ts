import type { Context } from "hono";
import type { PageName } from "@hono/inertia";
import { resolvePageHead } from "./page-head";
import { readNotice } from "./transient-cookie";

export async function renderPage<C extends PageName, P extends Record<string, unknown>>(c: Context, secret: string, component: C, props: P) {
  const notice = await readNotice(c, secret);
  const pageProps = { ...props, errors: notice.errors ?? {}, flash: notice.flash ?? null };
  const head = resolvePageHead({ component, props: pageProps });
  return c.render(component, { ...pageProps, head });
}

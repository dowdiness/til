import type { Page } from "@inertiajs/core";
import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import { renderToString } from "react-dom/server";
import type { PageObject } from "@hono/inertia";
import { AppShell } from "./inertia-app";

const publicPages: Record<string, () => Promise<{ default: ResolvedComponent }>> = {
  "Posts/Index": () => import("./pages/Posts/Index"),
  "Posts/Show": () => import("./pages/Posts/Show"),
};

async function resolvePublicPage(name: string): Promise<ResolvedComponent> {
  const page = await publicPages[name]?.();
  if (!page) throw new Error(`Page is not available for SSR: ${name}`);
  return page.default;
}

export function isPublicPage(component: string): boolean {
  return component === "Posts/Index" || component === "Posts/Show";
}

export async function renderPublicPage(page: PageObject): Promise<string> {
  const result = await createInertiaApp({
    page: page as Page,
    render: renderToString,
    resolve: resolvePublicPage,
    serverHead: true,
    setup: ({ App, props }) => (
      <AppShell>
        <App {...props} />
      </AppShell>
    ),
  });

  return result.body;
}

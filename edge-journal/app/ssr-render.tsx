import type { Page } from "@inertiajs/core";
import { createInertiaApp, type ResolvedComponent } from "@inertiajs/react";
import { renderToString } from "react-dom/server";
import type { PageObject } from "@hono/inertia";
import { AppProviders } from "./inertia-app";

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

function toInertiaPage(page: PageObject): Page {
  const scrollProps = page.scrollProps
    ? Object.fromEntries(
        Object.entries(page.scrollProps).map(([key, value]) => [
          key,
          { ...value, reset: false },
        ]),
      )
    : undefined;

  return {
    component: page.component,
    props: { ...page.props, errors: {} },
    url: page.url,
    version: page.version,
    deferredProps: page.deferredProps,
    initialDeferredProps: page.deferredProps,
    rescuedProps: [],
    mergeProps: page.mergeProps,
    prependProps: page.prependProps,
    deepMergeProps: page.deepMergeProps,
    matchPropsOn: page.matchPropsOn,
    scrollProps,
    flash: {},
    rememberedState: {},
  };
}

export async function renderPublicPage(page: PageObject, nonce: string): Promise<string> {
  const result = await createInertiaApp({
    page: toInertiaPage(page),
    render: renderToString,
    resolve: resolvePublicPage,
    serverHead: true,
    setup: ({ App, props }) => (
      <AppProviders>
        <App {...props} />
      </AppProviders>
    ),
  });

  const bootstrap = '<script data-page="app"';
  if (!result.body.includes(bootstrap)) throw new Error("Public SSR output is missing the Inertia bootstrap script");
  return result.body.replace(bootstrap, `<script nonce="${nonce}" data-page="app"`);
}

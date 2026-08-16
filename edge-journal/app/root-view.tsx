import { renderToString } from "react-dom/server";
import { ReactRefresh, Script, ViteClient } from "vite-ssr-components/react";
import { serializePage, type PageObject, type RootView } from "@hono/inertia";
import journalFontUrl from "@fontsource-variable/ibm-plex-sans/files/ibm-plex-sans-latin-wght-normal.woff2?url";
import { resolvePageMetadata } from "../lib/page-head";
import { isPublicPage, renderPublicPage } from "./ssr-render";

function clientBody(page: PageObject): string {
  return `<script data-page="app" type="application/json">${serializePage(page)}</script><div id="app"></div>`;
}

function Document({ page, body }: { page: PageObject; body: string }) {
  const metadata = resolvePageMetadata(page);

  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#fafafa" />
        <link rel="preload" href={journalFontUrl} as="font" type="font/woff2" crossOrigin="anonymous" />
        <title data-inertia="">{metadata.title}</title>
        {metadata.description ? (
          <meta data-inertia="description" name="description" content={metadata.description} />
        ) : null}
        {metadata.robots ? (
          <meta data-inertia="robots" name="robots" content={metadata.robots} />
        ) : null}
        <ViteClient />
        <ReactRefresh />
        <Script src="/src/client.tsx" />
      </head>
      <body dangerouslySetInnerHTML={{ __html: body }} />
    </html>
  );
}

export const rootView: RootView = async (page) => {
  const body = isPublicPage(page.component) ? await renderPublicPage(page) : clientBody(page);
  return `<!DOCTYPE html>${renderToString(<Document page={page} body={body} />)}`;
};

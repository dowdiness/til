# Edge Journal

Edge Journal is a compact, server-driven editorial blog for Cloudflare Workers. It demonstrates public reading pages plus a Basic Auth protected admin CRUD without introducing a REST API, client data-fetching layer, or client router.

Public pages (`Posts/Index` and `Posts/Show`) are server-rendered on initial document requests using Inertia and React's `renderToString()`, then hydrated by Inertia/React in the browser. Admin and error pages remain CSR shells that mount from a serialized Inertia page object. Inertia navigation and the JSON/partial reload protocol are unchanged for both SSR'd and CSR routes.

## Stack and versions

All direct dependencies are pinned in `package.json` and `pnpm-lock.yaml`:

- `@hono/inertia` 0.7.0, `@inertiajs/core` 3.6.1, and `@inertiajs/react` 3.6.1 — the Inertia protocol, typed `c.render()`, selective SSR/hydration, links, document head, and forms
- nuqs 2.9.5 — shared, typed parsing and serialization for public and admin search parameters
- Hono 4.13.2 — Workers-native routing, middleware, cookies, Basic Auth, and HTTP responses
- React / React DOM 19.2.8 — selective public-page SSR, hydration, browser page components, and the document shell
- Astryx Core 0.4.1, Astryx Neutral 0.4.1, and StyleX 0.19.0 — accessible UI components, theme tokens, and the visual system; production compiles Astryx source via `@astryxdesign/build/vite` with StyleX tree-shaking
- `@astryxdesign/build` 0.4.1, `@stylexjs/unplugin` 0.19.0, `@stylexjs/babel-plugin` 0.19.0, and `@babel/core` 7.28.5 — Astryx source-build pipeline and StyleX compilation
- IBM Plex Sans Variable 5.3.0 — self-hosted Latin variable font for editorial and interface typography
- `@cloudflare/vite-plugin` 1.52.1, Vite 8.2.1, and `vite-ssr-components` 0.6.1 — workerd-based development plus correct development/production asset tags
- Drizzle ORM 0.45.2 and Drizzle Kit 0.31.10 — typed D1 queries and generated SQLite migrations; both are stable releases
- Valibot 1.4.2 — compact edge-friendly server input validation
- Wrangler 4.123.0 — bindings, local D1, type generation, preview, and deployment
- `@cloudflare/vitest-pool-workers` 0.21.3 and Vitest 4.1.10 — tests inside the Workers runtime with isolated D1 storage
- TypeScript 5.9.3 — strict static checking

Inertia lets each Hono GET route pass DTOs directly as page props. React does not call `fetch()` for ordinary page data, and there is no independent API contract or duplicated client cache to maintain. Pointer-initiated article visits opt into Inertia's native View Transition integration for a shared-title transition; keyboard navigation, reduced-motion users, unsupported browsers, search, and pagination retain normal immediate navigation.

## Astryx design system

Astryx is the explicit exception to this demo's original "no external UI framework" constraint. Tailwind, shadcn/ui, and other UI frameworks remain excluded. Production compiles Astryx TypeScript + StyleX source via `@astryxdesign/build/vite`, emitting only styles for imported components. Development imports the pre-built component CSS via `src/astryx-dev.css` for Cloudflare Worker startup compatibility. Astryx reset and Neutral theme remain built/static in both modes.

`app/inertia-app.tsx` shares the Astryx `Theme` and `LinkProvider` wrapper between public SSR and browser hydration. `src/client.tsx` boots that shared tree. The provider delegates ordinary Astryx links and link-shaped buttons to `@inertiajs/react` rather than replacing Inertia navigation. Advanced links that need partial reload or hover prefetch continue to use Inertia `Link` directly, styled with Astryx tokens.

The interface uses Astryx `Button`, `TextInput`, `TextArea`, `Selector`, `Banner`, `Stack`, `Heading`, `Text`, and `EmptyState`. Astryx Neutral is customized into a light-only, card-free publication ledger: subtly grained paper-white surfaces, graphite typography, dotted leaders, near-square controls, and a centered 44rem column. A bounded focus-pull language uses blur for ledger arrival, article View Transitions, and the translucent search plane while keeping active text sharp. Devices reporting limited memory or concurrency, Save-Data, reduced transparency, or reduced motion receive progressively lighter effects. A preloaded, self-hosted IBM Plex Sans variable font drives both Astryx and editorial typography with a compact role-based scale. Public pages prioritize quiet reading and scanning; administration reuses the same visual grammar while remaining task-focused. The design takes structural inspiration from unvalley.me without copying its identity, profile content, logo, or assets. See `DESIGN.md` for the durable rules.

## Required local values

Copy the value-free template and fill it locally:

```sh
cp .dev.vars.example .dev.vars
```

- `ADMIN_USERNAME` — the single demo administrator name
- `ADMIN_PASSWORD` — the single demo administrator password
- `COOKIE_SECRET` — a strong random signing secret (use at least 32 bytes)

`.dev.vars`, `.env`, local D1 state, build output, and dependencies are ignored by Git. Do not put real values in `.dev.vars.example` or `wrangler.jsonc`.

## Install and local startup

```sh
pnpm install
cp .dev.vars.example .dev.vars
# Fill the local values in .dev.vars.
pnpm cf-typegen
pnpm db:migrate:local
pnpm db:seed:local
pnpm dev
```

Open the URL printed by Vite. Visit `/admin` and enter the credentials from `.dev.vars`.

Useful commands:

```sh
pnpm db:generate       # generate SQL from db/schema.ts
pnpm db:migrate:local  # apply committed migrations to local D1
pnpm db:seed:local     # insert demo rows into local D1
pnpm typecheck
pnpm test
pnpm build
pnpm preview
pnpm check             # typecheck + test + build
```

The seed uses stable unique slugs and `INSERT OR IGNORE`, so running it repeatedly preserves existing rows and does not create duplicates. It does not reset edits made to an existing seed row.

## Production setup (instructions only)

No remote resource or secret is created automatically. When explicitly approved, create the database and copy the returned ID into the `database_id` field in `wrangler.jsonc`:

```sh
pnpm exec wrangler d1 create edge-journal-db
```

Review migrations before applying them remotely:

```sh
pnpm exec wrangler d1 migrations apply edge-journal-db --remote
```

Set secrets interactively so their values do not appear in shell history or source control:

```sh
pnpm exec wrangler secret put ADMIN_USERNAME
pnpm exec wrangler secret put ADMIN_PASSWORD
pnpm exec wrangler secret put COOKIE_SECRET
```

Then regenerate binding types, run the full check, and deploy only with explicit authorization:

```sh
pnpm cf-typegen
pnpm check
pnpm deploy
```

Production migration and Worker deployment are intentionally separate operational steps.

## Routes and pages

- `GET /` → `Posts/Index`: six published posts per page, `page` pagination, and `q` title/excerpt search
- `GET /posts/:slug` → `Posts/Show`: published article detail; drafts and unknown slugs return 404
- `GET /admin` → 303 to `/admin/posts`
- `GET /admin/posts` → `Admin/Posts/Index`, with `q` search and `status` filtering
- `GET /admin/posts/new` → `Admin/Posts/New`
- `POST /admin/posts` → create then 303
- `GET /admin/posts/:id/edit` → `Admin/Posts/Edit`
- `PATCH /admin/posts/:id` → update then 303
- `DELETE /admin/posts/:id` → soft-delete then 303 to an undoable admin state
- `POST /admin/posts/:id/restore` → restore a soft-deleted post then 303
- Missing resources → `Errors/NotFound`; unexpected failures → `Errors/InternalServerError`

## Structure

- `app/server.tsx` — Hono middleware and thin routes
- `app/root-view.tsx` — React document shell that selects public SSR or a CSR body and emits Vite assets
- `app/pages` and `app/components` — typed Inertia pages and shared UI
- `app/pages.gen.ts` — generated by `inertiaPages()`; do not edit it manually
- `src/client.tsx` and `src/styles.css` — Astryx providers, pre-built theme imports, and application-specific editorial layout
- `domain` — Valibot validation and the pure publication timestamp transition
- `db` — request-scoped `drizzle(c.env.DB)` construction, explicit DTO mapping, and purpose-specific queries/commands
- `drizzle/migrations` and `drizzle/seed.sql` — generated schema history and idempotent fixtures
- `lib` — one-time signed notices, typed nuqs search-parameter definitions, rendering, redirects, and same-origin checks
- `tests` — Workers-runtime integration tests using real D1 bindings

## Inertia conveniences

Public search, pagination, and admin filtering use partial reloads with URL synchronization, preserved component state, and preserved scroll position. Shared definitions in `lib/search-params.ts` use `nuqs/server`: `createLoader` parses Hono requests and `createSerializer` builds public `q`/`page` and admin `q`/`status` URLs while omitting default values. Inertia remains the sole navigation owner; no `NuqsAdapter` or unstable custom adapter is used because nuqs does not provide an Inertia adapter. Public search opens from the journal header in an accessible Astryx dialog; active queries remain visible beside the server-owned result count. Search and filter controls expose interruptible loading feedback during visits. Public article links prefetch their page object on hover for faster detail navigation, while authenticated admin navigation marks the current section with `aria-current`.

New and edit forms give `useForm` a route-specific remember key, so long drafts survive Inertia navigation and browser history restoration. Dirty forms warn before an Inertia GET navigation or full page unload; prefetch and the form's own mutation requests are never blocked by that guard. Delete is implemented as a reversible soft delete: the redirect exposes an authenticated Undo action, while all public, admin, and edit queries exclude deleted rows.

## Validation, flash, and redirects

Create and update share one Valibot schema in both browser and Worker. Fields validate after blur and continue validating as they are corrected; submit reveals all remaining field errors without a network request. Server validation and the D1 unique constraint remain authoritative: a duplicate insert/update is caught and converted to a `slug` field error rather than becoming a 500.

On failure, the Worker signs only the compact error map in a short-lived, HttpOnly, SameSite=Lax cookie and returns `303 See Other` to the form GET. The next GET reads and expires that cookie while rendering explicit `errors` and `flash` props. Inertia retains browser-side `useForm` input, so article bodies never enter cookies. Success follows the same one-time flow with a short message. Every mutation uses POST/Redirect/GET.

## D1 and domain boundaries

The Drizzle client is created from `c.env.DB` for each request; no request-bound database client is stored globally. Database rows are mapped to separate public and admin DTOs with ISO 8601 timestamps before entering Inertia props. Queries are parameterized through Drizzle.

One pure function owns publication time transitions: drafts use `null`, first publication uses the supplied current epoch milliseconds, published content-only edits retain the original timestamp, and reverting to draft clears it. Publication dates are formatted with a fixed `Asia/Tokyo` timezone for deterministic Worker/browser hydration. Delete and restore transition `deleted_at` while preserving the post payload and publication timestamps; active queries consistently require `deleted_at is null`. Soft-deleted rows retain their unique slug so Undo cannot be invalidated by a replacement post.

## Security model and limitations

Hono Basic Auth protects `/admin` and `/admin/*` using Worker secrets. It is intentionally a demo-only, single-administrator simplification—not registration, sessions, roles, password recovery, or a production identity system.

Hono CSRF middleware checks `Origin` / Fetch Metadata for unsafe requests with browser form content types (`application/x-www-form-urlencoded`, `multipart/form-data`, and `text/plain`). Inertia may submit JSON, so a small complementary middleware checks `Origin` and `Sec-Fetch-Site` on all unsafe requests. Cross-origin JSON also requires a browser preflight, and this same-origin app enables no CORS. Direct non-browser clients without these browser headers must still provide Basic Auth.

Article bodies are escaped React text rendered with `white-space: pre-wrap`; `dangerouslySetInnerHTML` is used only for `serializePage()` inside the document-shell JSON script, as required by `@hono/inertia`. Generic error pages expose neither stack traces nor database rows, and structured server logs contain only the request ID and error class.

Astryx improves consistency and accessibility coverage but increases the client CSS and component bundle compared with the original plain-CSS implementation. Keep per-component subpath imports and review bundle output when adding more Astryx modules.

Before evolving this demo into a production product, add an external identity provider or hardened rotating sessions, login and mutation rate limits, CSP tailored to deployed assets, secret rotation, audit logs, backup/restore procedures, a soft-delete retention and purge policy, observability alerts, accessibility testing, pagination abuse limits, and a staged migration/deployment process.

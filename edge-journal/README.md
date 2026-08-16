# Edge Journal

Edge Journal is a compact, server-driven editorial blog for Cloudflare Workers. It demonstrates public reading pages plus a Basic Auth protected admin CRUD built with Inertia page data and navigation.

Public pages (`Posts/Index` and `Posts/Show`) are server-rendered on initial document requests using Inertia and React's `renderToString()`, then hydrated by Inertia/React in the browser. Admin and error pages remain CSR shells that mount from a serialized Inertia page object. Inertia navigation and the JSON/partial reload protocol are unchanged for both SSR'd and CSR routes.

## Stack and versions

All direct dependencies are pinned in `package.json` and `pnpm-lock.yaml`:

- `@hono/inertia` 0.7.0, `@inertiajs/core` 3.6.1, and `@inertiajs/react` 3.6.1 — the Inertia protocol, typed `c.render()`, selective SSR/hydration, links, document head, and forms
- nuqs 2.9.5 — shared, typed parsing and serialization for public and admin search parameters
- Hono 4.13.2 — Workers-native routing, middleware, cookies, Basic Auth, and HTTP responses
- React / React DOM 19.2.8 — selective public-page SSR, hydration, browser page components, and the document shell
- Astryx Core 0.4.1, Astryx Neutral 0.4.1, and StyleX 0.19.0 — accessible UI components, theme tokens, and the visual system; production compiles Astryx source via `@astryxdesign/build/vite` with StyleX tree-shaking
- `@astryxdesign/build` 0.4.1, `@stylexjs/unplugin` 0.19.0, `@stylexjs/babel-plugin` 0.19.0, and `@babel/core` 7.28.5 — Astryx source-build pipeline and StyleX compilation
- Tailwind CSS and `@tailwindcss/vite` 4.3.3 — the configured application design system for frame, region, responsive, spacing, typography, and row layout utilities
- IBM Plex Sans Variable 5.3.0 — self-hosted Latin variable font for editorial and interface typography
- `@cloudflare/vite-plugin` 1.52.1, Vite 8.2.1, and `vite-ssr-components` 0.6.1 — workerd-based development plus correct development/production asset tags
- Drizzle ORM 0.45.2 and Drizzle Kit 0.31.10 — typed D1 queries and generated SQLite migrations; both are stable releases
- Valibot 1.4.2 — compact edge-friendly server input validation
- Wrangler 4.123.0 — bindings, local D1, type generation, preview, and deployment
- `@cloudflare/vitest-pool-workers` 0.21.3 and Vitest 4.1.10 — tests inside the Workers runtime with isolated D1 storage
- TypeScript 5.9.3 — strict static checking

Inertia lets each Hono GET route pass DTOs directly as page props and currently owns ordinary page-data navigation without an independent client cache. Pointer-initiated article visits opt into Inertia's native View Transition integration for a shared-title transition; keyboard navigation, reduced-motion users, unsupported browsers, search, and pagination retain normal immediate navigation.

## Astryx design system

Astryx supplies the current UI components and theme. Production compiles Astryx TypeScript and app-authored StyleX via `@astryxdesign/build/vite`, emitting styles for imported components and overrides. Development keeps Astryx on its pre-built component CSS via `src/astryx-dev.css` while the same plugin compiles app-authored StyleX without aliasing Astryx to source. Astryx reset and Neutral theme remain built/static in both modes.

Styling has one owner per concern. Astryx owns component behavior and runtime theme variables, with Edge Journal's Neutral-theme customization isolated in `src/astryx-theme.css`. Tailwind is the application-facing design system: `src/tailwind-theme.css` maps named content budgets and responsive contracts onto Astryx's official Tailwind bridge and supplies the utility vocabulary used directly by page regions. StyleX in `app/styles/astryx-overrides.stylex.ts` is restricted to Astryx `xstyle` overrides. `src/styles.css` owns browser/document surfaces such as the font face, View Transition pseudo-elements, dialog backdrop, accessibility preferences, and the narrow Astryx integration boundary. No application layout selectors remain in global CSS.

`app/inertia-app.tsx` shares the Astryx `Theme` and `LinkProvider` wrapper between public SSR and browser hydration. `src/client.tsx` boots that shared tree. The provider delegates ordinary Astryx links and link-shaped buttons to `@inertiajs/react` rather than replacing Inertia navigation. Advanced links that need partial reload or hover prefetch continue to use Inertia `Link` directly, styled with Astryx tokens.

The interface uses Astryx `Button`, `Icon`, `IconButton`, `TextInput`, `TextArea`, `Selector`, `FormLayout`, `Dialog`, `Pagination`, `Banner`, `Heading`, `Text`, and `EmptyState`. Astryx Neutral is customized into a light-only, card-free publication ledger: subtly grained paper-white surfaces, graphite typography, dotted leaders, near-square controls, and a centered 44rem column. A bounded focus-pull language uses blur for ledger arrival, article View Transitions, and the translucent search plane while keeping active text sharp. Devices reporting limited memory or concurrency, Save-Data, reduced transparency, or reduced motion receive progressively lighter effects. A preloaded, self-hosted IBM Plex Sans variable font drives both Astryx and editorial typography with a compact role-based scale. Public pages prioritize quiet reading and scanning; administration reuses the same visual grammar while remaining task-focused. The design takes structural inspiration from unvalley.me. See `DESIGN.md` for the current visual system.

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

## Safe operations

Remote commands are explicit and are not part of `pnpm check`. Confirm the target account/database first; these commands mutate or export remote state as noted:

```sh
pnpm exec wrangler whoami                 # preflight identity
pnpm db:info                              # inspect D1 metadata
pnpm db:migrate:remote:status             # read remote migration state
pnpm db:backup                            # REMOTE EXPORT: timestamped SQL backup
pnpm db:migrate:remote:apply              # REMOTE MUTATION: apply reviewed migrations
pnpm exec wrangler d1 time-travel info edge-journal-db # inspect recovery points
```

Backups go to ignored `backups/`. Rehearse an import against local or staging first and verify row counts and reads; never overwrite production during rehearsal. A production restore is emergency-only and destructively overwrites the target. Confirm the incident decision, take a fresh backup, and choose exactly one deliberate recovery point—never run both commands or copy an example value.

Restore by timestamp:

```sh
pnpm exec wrangler d1 time-travel restore edge-journal-db --timestamp="<RFC3339_OR_UNIX_TIMESTAMP>"
```

Or restore by bookmark:

```sh
pnpm exec wrangler d1 time-travel restore edge-journal-db --bookmark="<BOOKMARK>"
```

The seed is idempotent and does not reset edited rows.

## Production setup (instructions only)

This Worker combines the public blog and `/admin` in one deployment. Worker-level Access would therefore hide the public blog. Use a hostname/path Access application instead.

### Preflight and order

1. Confirm an active DNS zone for `<PRODUCTION_HOSTNAME>`, Zero Trust availability, an IdP with MFA (or independent MFA), and permissions to manage Workers, Access, WAF, secrets, and D1. Run `pnpm exec wrangler whoami`, `pnpm db:info`, `pnpm check`, and review every migration.
2. Before serving the hostname when possible, open **Zero Trust > Access controls > Applications > Create new application > Self-hosted and private > Add public hostname**. Add two protected destinations: `<PRODUCTION_HOSTNAME>/admin` and `<PRODUCTION_HOSTNAME>/admin/*`. The wildcard child path does not cover the parent path.
3. Access is deny-by-default. Add one **Allow** policy whose Include selector matches only `<ALLOWED_EMAIL_OR_GROUP>`. Do not add a broad email-domain rule unless every account in that domain is trusted. Enable only the intended IdP and use instant authentication when it is the sole IdP.
4. Require MFA. For an IdP that reports MFA, add **Require > Authentication method > mfa** to the Allow policy. Otherwise enable independent MFA at the organization level and select **Custom MFA settings** for the application or policy. Start with an 8-hour application session and require MFA on each login or use a deliberately bounded MFA session; tune both to the operator's risk tolerance.
5. In **Workers & Pages > Worker > Settings > Domains & Routes > Add > Custom Domain**, add `<PRODUCTION_HOSTNAME>` and confirm the route points to this Worker. Do not use Worker-level Access here: it would also require authentication for the public blog.

Use this as a template—not a current-state claim—in `wrangler.jsonc`, deliberately substituting the hostname and then rerun `pnpm cf-typegen` and `pnpm check`:

```jsonc
"workers_dev": false,
"preview_urls": false,
"routes": [{ "pattern": "<PRODUCTION_HOSTNAME>", "custom_domain": true }]
```

Do not expose credentials in source control. Set production secrets interactively:

```sh
pnpm exec wrangler secret put ADMIN_USERNAME
pnpm exec wrangler secret put ADMIN_PASSWORD
pnpm exec wrangler secret put COOKIE_SECRET
```

Never copy `.dev.vars` into production or expose secret values in shell history, logs, or CI output. Rotate all three before launch and invalidate the old credentials.

### Rate limiting, deploy, and rollback

In the zone dashboard, open **Security rules > Create rule > Rate limiting rules**. Use the field builder to match hostname `<PRODUCTION_HOSTNAME>` and URI paths beginning with `/admin`. Use IP as the counter characteristic and tune these starting points against real traffic:

- Unsafe mutations with method `POST`, `PATCH`, or `DELETE`: 20 requests/minute/IP, Block for 10 minutes.
- Optional all-admin safety rule: 120 requests/minute/IP, with a shorter mitigation suitable for interactive use.

Save the rules as drafts first, confirm their match scope, then deploy them. Access remains the primary identity control; rate limiting only limits abuse.

After Access is ready and the custom-domain/`workers_dev`/preview settings have been reviewed, deploy in this order:

```sh
pnpm db:migrate:remote:status             # inspect pending migrations
pnpm db:backup                            # remote export before mutation
pnpm db:migrate:remote:apply              # REMOTE MUTATION: reviewed migrations only
pnpm cf-typegen
pnpm check
pnpm exec wrangler deploy --dry-run       # inspect; no deployment
pnpm deploy                               # REMOTE MUTATION
```

Validate public `200` without auth; an admin request gets the Access challenge before Basic Auth; an authorized MFA user then passes Basic Auth; an unauthorized identity is denied; workers.dev/preview URLs cannot bypass controls; CSP and `private, no-store` are present; CRUD and restore work; logs contain expected request/error events without secrets; and a backup is readable. Keep the prior Worker version. If needed, inspect `pnpm exec wrangler versions list` and roll back with `pnpm exec wrangler rollback` to a known-good version. Roll back the Worker before reversing a migration unless the migration is backward-compatible. Rehearse D1 restore locally or in staging.

Official references: [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/), [Cloudflare Access](https://developers.cloudflare.com/workers/configuration/cloudflare-access/), [Access application paths](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/app-paths/), [MFA requirements](https://developers.cloudflare.com/cloudflare-one/access-controls/policies/mfa-requirements/), [zone rate limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/create-zone-dashboard/), and [D1 Time Travel](https://developers.cloudflare.com/d1/reference/time-travel/).

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
- `app/styles` — Astryx-only StyleX overrides plus static, extraction-safe Tailwind variant maps
- `app/pages.gen.ts` — generated by `inertiaPages()`
- `src/astryx-theme.css` — Edge Journal's Astryx Neutral runtime-token customization
- `src/tailwind.css`, `src/tailwind-reset.css`, and `src/tailwind-theme.css` — Tailwind layer entry, default-theme reset, Astryx token bridge, application budgets, and semantic design tokens
- `src/client.tsx` and `src/styles.css` — browser entry plus global document, View Transition, accessibility, and Astryx integration styling
- `domain` — Valibot validation and the pure publication timestamp transition
- `db` — request-scoped `drizzle(c.env.DB)` construction, explicit DTO mapping, and purpose-specific queries/commands
- `drizzle/migrations` and `drizzle/seed.sql` — generated schema history and idempotent fixtures
- `lib` — one-time signed notices, typed nuqs search-parameter definitions, rendering, redirects, and same-origin checks
- `tests` — Workers-runtime integration tests using real D1 bindings

## Inertia conveniences

Public search, pagination, and admin filtering use partial reloads with URL synchronization, preserved component state, and preserved scroll position. Shared definitions in `lib/search-params.ts` use `nuqs/server`: `createLoader` parses Hono requests and `createSerializer` builds public `q`/`page` and admin `q`/`status` URLs while omitting default values. Public search keeps its uncommitted Dialog text local and applies it through Inertia on submit. The inline admin filters use `useQueryStates` with nuqs' community-contributed Inertia adapter from the official registry, extended locally to retain Inertia partial props and expose navigation completion to React transitions. Text changes use nuqs' 300ms `debounce()`, while status changes, Clear, and Enter apply immediately. The adapter relies on nuqs' explicitly unstable, upgrade-sensitive custom-adapter API; it uses no independent debounce timer. Public search opens from the journal header in an accessible Astryx dialog; active queries remain visible beside the server-owned result count. Search and filter controls expose interruptible loading feedback during visits. Public article links prefetch their page object on hover for faster detail navigation, while authenticated admin navigation marks the current section with `aria-current`.

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

Article bodies are escaped React text rendered with `white-space: pre-wrap`; `dangerouslySetInnerHTML` is used only for `serializePage()` inside the document-shell JSON script, as required by `@hono/inertia`. A per-request nonce authorizes that bootstrap script under the production Content Security Policy. Admin responses are `private, no-store`, generic error pages expose neither stack traces nor database rows, and structured logs record only request IDs, event names, post IDs, and error classes—never post content or credentials.

Astryx improves consistency and accessibility coverage but increases the client CSS and component bundle compared with the original plain-CSS implementation. The current code uses per-component subpath imports.

The production controls and validation sequence are documented in [Production setup](#production-setup-instructions-only). Longer-term hardening still includes a soft-delete retention and purge policy, optimistic edit-conflict detection, accessibility testing, and pagination abuse limits.

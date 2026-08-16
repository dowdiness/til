# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Public readers browse and search concise notes about software, systems, and making technical work understandable.
- A single authenticated administrator creates, edits, publishes, filters, soft-deletes, and restores posts.

## Product Purpose

Edge Journal is a compact, server-driven editorial blog and a working demonstration of React 19, Inertia, Hono, D1, and Cloudflare Workers. Success means readers can find and read published notes with minimal friction while the administrator can manage publication safely without a separate REST API or client-side data layer.

## Positioning

Page data, validation results, redirects, and navigation remain server-owned while Inertia adds partial reloads, prefetching, remembered forms, and navigation guards without introducing a client router or duplicated cache.

## Operating Context

Readers use the public journal index, search, pagination, and article pages. The administrator uses a Basic Auth protected CRUD interface with publication-state filtering and long-form editing. The application is developed and tested locally against the Workers runtime and D1, then may be deployed only through an explicitly authorized Cloudflare workflow.

## Capabilities and Constraints

- Public listing, title/excerpt search, pagination, and published-article detail.
- Basic Auth protected create, edit, filter, publish/draft, and undoable delete workflows.
- Inertia owns navigation and page data; there is no REST API, React Router, global state library, or client-side page-data `fetch()`. Public pages use selective server-side rendering on initial document requests; admin and error pages remain CSR shells.
- Valibot owns server validation. Mutations use PRG with `303` redirects and signed one-time cookies for compact errors and flash messages.
- D1 clients are request-scoped from `c.env.DB`; database rows cross explicit DTO boundaries.
- Astryx is the only permitted external UI framework. Existing Inertia partial reloads, prefetching, remembered forms, and unsaved-change guards must remain intact.
- Remote resources, secrets, migrations, and deployment require explicit authorization.

## Brand Commitments

- The product name is **Edge Journal**.
- Product copy remains concise, factual, and editorial rather than promotional.
- The public journal should adopt the visual language confirmed from `unvalley.me`: narrow reading width, neutral monochrome surfaces, generous whitespace, light typography, dotted leaders, and card-free lists.
- Administration should share that visual language while prioritizing task clarity.
- The reference site's identity, logo, profile copy, and proprietary assets must not be copied.

## Evidence on Hand

- Working application code and routes under `app/`, `domain/`, `db/`, and `lib/`.
- Idempotent demonstration content in `drizzle/seed.sql`.
- Workers-runtime integration tests under `tests/`.
- No testimonials, customer claims, benchmarks, or production deployment evidence; future work must not fabricate them.

## Product Principles

1. Keep server ownership visible in the architecture, not in reader friction.
2. Favor legibility and directness over ornamental interface chrome.
3. Preserve publication safety and clear state transitions in every admin workflow.
4. Add client convenience only when it does not create a second source of truth.
5. Treat accessibility, responsive behavior, and explicit DTO boundaries as product requirements.

## Accessibility & Inclusion

Use semantic HTML, keyboard-visible focus, labeled controls, readable contrast, reduced-motion support, and responsive layouts that remain usable at narrow mobile widths.

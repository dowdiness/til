# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Public readers browse and search concise notes about software, systems, and making technical work understandable.
- A single authenticated administrator creates, edits, publishes, filters, soft-deletes, and restores posts.

## Product Purpose

Edge Journal is a compact, server-driven editorial blog and a working demonstration of React 19, Inertia, Hono, D1, and Cloudflare Workers. Readers can find and read published notes with minimal friction, while the administrator can manage publication safely.

## Current Architecture

Page data, validation results, redirects, and navigation are server-owned. Inertia provides partial reloads, prefetching, remembered forms, and navigation guards. Public pages use selective server-side rendering on initial document requests; admin and error pages use CSR shells.

Valibot handles server validation. Mutations use PRG with `303` redirects and signed one-time cookies for compact errors and flash messages. D1 clients are request-scoped from `c.env.DB`, and database rows cross explicit DTO boundaries. Astryx supplies the current UI components and theme.

## Product Surface

Readers use the public journal index, search, pagination, and article pages. The Basic Auth protected administration surface provides create, edit, filter, publish/draft, soft-delete, and restore workflows.

The visual direction is a narrow, card-free publication ledger with neutral surfaces, generous whitespace, light typography, and dotted leaders. Administration shares the same visual language while prioritizing task clarity. The product name is **Edge Journal**, and its copy is concise and editorial.

## Evidence

- Working application code and routes under `app/`, `domain/`, `db/`, and `lib/`.
- Idempotent demonstration content in `drizzle/seed.sql`.
- Workers-runtime integration tests under `tests/`.

## Accessibility

The current interface uses semantic HTML, keyboard-visible focus, labeled controls, readable contrast, reduced-motion support, and responsive layouts.

## Operations

Remote resources, secrets, migrations, and deployment require explicit authorization.

---
name: Edge Journal
description: A quiet publication ledger — paper white, graphite ink, dotted leaders, square controls, one 44rem column.
colors:
  paper: "#fafafa"
  white: "#ffffff"
  muted: "#f3f3f3"
  graphite: "#414141"
  graphite-dark: "#171717"
  graphite-heading: "#242424"
  metadata: "#737373"
  border: "#dedede"
  border-emph: "#ababab"
  leader: "#d4d4d4"
  rule-strong: "#b8b8b8"
  divider: "#8b8b8b"
  published: "#2f6645"
  draft: "#6f6f6f"
  destructive: "#963a3a"
  selection-bg: "#3d3d3d"
typography:
  body:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, ui-sans-serif, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.65
  brand:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, ui-sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.01em"
  display:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, ui-sans-serif"
    fontSize: "clamp(2.25rem, 7vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, ui-sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "-0.012em"
  lead:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, ui-sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0"
  reading:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, ui-sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.75
  entry:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, ui-sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0"
  utility:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, ui-sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, ui-sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  supporting:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, ui-sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  element: "0.25rem"
  container: "0.35rem"
  page: "0"
spacing:
  xs: "0.25rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "2rem"
  xl: "3rem"
  xxl: "3.75rem"
components:
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.graphite-dark}"
    rounded: "{rounded.element}"
    padding: "0.45rem"
  entry-link:
    textColor: "{colors.graphite}"
    rounded: "0"
---

# Design System: Edge Journal

## Overview

**Creative North Star: "The Quiet Ledger"**

Edge Journal is a single-column, card-free publication surface. It borrows the grammar of a printed index: title and date sit on a shared baseline separated by a dotted leader, no container chrome wraps entries, and whitespace replaces decoration. The administrator inherits the same grammar — filters, lists, and forms share the same type scale, leader lines, and column width.

Key Characteristics:

- **Card-free index.** Entries are bare rows separated by vertical rhythm; no borders, shadows, or backgrounds wrap individual posts.
- **Dotted leaders over borders.** Horizontal dividers use `1px dotted` for section boundaries and pagination; solid borders appear only for article dividers and form separators.
- **Graphite on paper.** All type lives in a single gray family (`#414141` primary, `#737373` secondary). A deterministic 4.5KB monochrome grain tile gives the paper surface physical variation without a generated filter or animated layer. The sole near-black (`#171717`) is reserved for the wordmark, focus outlines, and caret color.
- **Square controls.** Element radius is `0.25rem`; containers `0.35rem`. Page radius is zero. Nothing looks rounded.
- **One column.** `min(100% - 2rem, 44rem)` centered. Article body is `66ch`. There is no sidebar and no grid.

## Colors

The interface palette is a single gray family on paper white. Chromatic color is reserved for semantic publication and destructive states.

### Primary
- **Graphite Dark** (`#171717`): wordmark, focus outlines, caret color, selection text. Used sparingly so its rarity carries weight.

### Neutral
- **Paper** (`#fafafa`): page background. `theme-color` meta matches.
- **White** (`#ffffff`): card surfaces when Astryx components render them.
- **Muted** (`#f3f3f3`): unsaved-state banner and similar low-emphasis surfaces.
- **Graphite** (`#414141`): primary body text, entry titles, article body.
- **Metadata Gray** (`#737373`): secondary text, dates, excerpts, nav links, placeholder text.
- **Graphite Heading** (`#242424`): page-level `h1` color — one step darker than body for hierarchy without a hue shift.
- **Border** (`#dedede`): default input and card borders.
- **Border Emph** (`#ababab`): emphasized borders.
- **Leader** (`#d4d4d4`): dotted leaders for entry rules, pagination, and filter separators.
- **Divider** (`#8b8b8b`): the article body's short solid divider.

### Semantic
- **Published** (`#2f6645`): published status badge.
- **Draft** (`#6f6f6f`): draft status label.
- **Destructive** (`#963a3a`): delete actions.

**The Mono-Gray Rule.** Navigation and editorial emphasis stay within the gray family; green and red are reserved for publication status and destructive actions.

## Typography

**Body Font:** IBM Plex Sans Variable / IBM Plex Sans (with system sans-serif fallbacks)

**Character:** A single self-hosted variable sans-serif with an engineered, editorial texture. Synthesis is disabled and `font-display: swap` keeps text available during loading. Size, weight (400–500), restrained tracking, and line-height establish hierarchy within the same font family. Plex's open forms are allowed to breathe at text sizes; negative tracking appears on brand and display roles.

### Hierarchy
- **Brand** (500, 1.25rem, 1.4, −0.01em): wordmark only.
- **Article display** (500, `clamp(2.25rem, 7vw, 3rem)`, 1.12, −0.02em): article `h1` only. Restrained tracking keeps large Plex forms composed.
- **Page heading** (500, 1.5rem, 1.3, −0.012em): page-intro `h1`, admin headings, form headings.
- **Lead** (400, 1.1875rem, 1.65, natural tracking): introductory and article-deck copy.
- **Entry title** (500, 1.125rem, 1.45, natural tracking): journal entry titles. A firmer mid-weight keeps them legible alongside the leader and date.
- **Body** (400, 1rem, 1.65): ordinary web text. Article body uses 1.125rem / 1.75 for long-form reading.
- **Utility** (400, 1rem, 1.5): article footer links and compact controls.
- **Label** (400, 1rem, 1.5): nav links, dates, section headings, excerpts, and pagination. Tabular numerals are used for dates and pagination.
- **Supporting** (400, 0.875rem, 1.5): the sole small-text exception, reserved for tertiary metadata such as counts, footer text, post meta, and admin update details.

**The Single-Family Rule.** Editorial and interface copy uses self-hosted IBM Plex Sans Variable at weights 400–500. Astryx body and heading tokens resolve to the same family. Monospace is restricted to slugs and code-like values rendered by Astryx `Text type="code"`.

## Layout

A single centered column: `width: min(100% - 2rem, 44rem)`. Vertical padding is 2.5rem top, 2rem bottom, expanded when viewport safe-area insets require it. The article body narrows further to `max-width: 66ch` for optimal measure.

The public header keeps the wordmark as its only navigation and adds a compact search icon on the journal index. The icon opens a focused search dialog rather than exposing the form in the publication flow. Authenticated admin routes replace that action with a two-link Journal/Admin nav on the right, sharing the wordmark baseline with `gap: 2rem`. Below the header, a large top margin (`clamp(3.75rem, 9vw, 5.5rem)`) separates identity from content.

The search form lives in a top-anchored native dialog sized to the viewport; its action expands to full width on phones. Admin filter forms use CSS grid with a flexible input column and `auto`-sized controls. At ≤43.75rem journal entries become a two-column title/date row with a dotted rule beneath. At ≤31.25rem admin detail, pagination, and action groups stack vertically; journal title/date rows remain paired so the ledger relationship survives on phones.

The site footer sits after `clamp(6rem, 15vw, 9rem)` of margin — a generous terminal whitespace. Public pages end with the publication name; admin pages add a quiet Administration context label.

## Elevation & Depth

The layout is physically flat, using a static, nearly transparent monochrome grain tile to give the paper surface a tactile tooth. Optical depth appears during focus changes: bounded blur softens the ledger as search takes focus and turns article navigation into a short focus pull. Astryx components such as flash banners provide the few card surfaces; the journal index is a bare ledger.

## Shapes

Element radius is `0.25rem` (near-square). Container radius is `0.35rem`. Page-level radius is `0`. All controls — buttons, inputs, banners — read as rectangular with softened corners. Dotted lines (`1px dotted`) are the primary separator vocabulary, replacing solid borders wherever a division is structural rather than functional.

## Components

### Journal Entry
Bare rows with no background, border, or container. On wide screens, title and date share a flex baseline with a `1px dotted` leader filling the space between. On narrow screens, they remain paired in a two-column row; the leader becomes a full dotted rule beneath that row while long titles wrap independently of the fixed date. Excerpt sits below in metadata gray at 1rem.

### Search Dialog
The journal-index header action is an Astryx `IconButton` with Astryx's semantic search `Icon`. It opens Astryx's native `Dialog` near the top of the viewport with a 78% white paper surface, the same static grain as the page, an emphasized 1px border, dotted internal rule, auto-focused clearable `TextInput`, explicit close action using Astryx's semantic close `Icon`, and primary submit. On capable hardware, a 10px surface backdrop blur and 4px page blur establish a transparent focus plane without a shadow; unsupported browsers receive an opaque white dialog. Escape and backdrop clicks dismiss it and restore focus. An active query is repeated beside the result count with a compact Clear action so server-owned filter state remains visible after the dialog closes.

### Pagination
Astryx `Pagination` in its compact, small configuration sits centered below the ledger. Its previous/next icon buttons drive interruptible Inertia partial visits while the page indicator updates optimistically. A `1px dotted` top rule retains the publication-ledger boundary, and page numerals remain tabular.

### Admin Filters
Three-column grid mirroring the search form. Bottom border is `1px dotted`. Plain status labels use `text-transform: capitalize` with semantic colors.

### Story Link
Plain underline-less text in inherited color when hover is available; hover/focus shifts to near-black (`#111111`) with an underline. On coarse or hoverless pointers, a permanent 1px muted underline supplies a restrained touch affordance while the full entry remains the hit area. Increased-contrast mode darkens the underline to current text color.

### Focus and response
`1px solid #171717` outline with `3px` offset on `:focus-visible` across all interactive elements. Admin navigation uses `aria-current="page"` plus an underline; the public header relies on the linked wordmark as the single route home. Links respond on pointer-down with a short opacity change; Astryx buttons retain their immediate press scale.

On coarse or hoverless pointers, header links, controls, and action links have a minimum 44px block size. Journal story links extend their hit area across the full entry without changing the visual measure. `viewport-fit=cover` plus safe-area padding protects the column in notched portrait and landscape viewports. `prefers-contrast: more` darkens secondary tokens, strengthens focus outlines, and changes dotted structural rules to solid lines.

Search and filter buttons show interruptible loading feedback during Inertia visits. Form fields validate with the shared Valibot schema after blur and while correcting touched fields. Soft deletion returns to an inline status region with an Undo action; restoring uses the normal authenticated mutation path.

## Motion

Motion is quiet and finite, organized as a focus pull. The journal ledger is the single authored entrance: newly mounted entries resolve from a 2px blur while fading and rising 4px over 125ms, staggered by 30ms and capped at 150ms so the sixth entry settles within 275ms. Interaction remains available throughout. Search-dialog entrance and exit both use the strong `--ease-out` curve; entrance is 225ms, while the app-owned exit remains interruptible and closes the native dialog after its transition completes. Flash and Undo status regions receive a 165ms fade-and-rise entrance to make server-owned outcomes legible.

Pointer-initiated article navigation uses Inertia's View Transition integration. Only the activated ledger title receives `article-title`, avoiding duplicate transition names while the title moves into its article heading over 225ms. The old root softens to a maximum 6px blur while fading over 125ms, and the new root resolves from the same blur over 225ms; the shared title stays sharp throughout. Search, pagination, modified clicks, and keyboard activation stay immediate. Unsupported browsers use Inertia's normal fallback without a second navigation path.

The client marks devices with at most 4GB reported memory, at most four logical processors, or Save-Data enabled as `data-visual-effects="low"`. That mode lowers page, entry, dialog, and backdrop blur to 2px, 1px, 4px, and 1.5px respectively while preserving the focus relationship. `prefers-reduced-transparency: reduce` removes blur and makes the search plane opaque. `prefers-reduced-motion: reduce` removes all positional movement and stagger: journal entries retain a 95ms opacity entrance, transient status retains a 95ms opacity transition, and dialog exit retains its 125ms opacity-only feedback. Article navigation uses the normal Inertia path under this preference, with a 1ms CSS safeguard for any transition initiated elsewhere.

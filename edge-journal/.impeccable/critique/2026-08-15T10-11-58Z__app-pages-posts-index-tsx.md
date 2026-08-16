---
target: public Journal homepage; Inter must not be used
total_score: 34
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 2
timestamp: 2026-08-15T10-11-58Z
slug: app-pages-posts-index-tsx
---
Method: dual-agent (A: worker/design-director · B: worker/detector-browser)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 4 | Search loading, counts, and empty-result status are explicit. |
| 2 | Match System / Real World | 3 | The ledger metaphor fits; public `Admin` navigation and implementation footer expose the demo machinery. |
| 3 | User Control and Freedom | 4 | Search can be cleared and navigation remains direct. |
| 4 | Consistency and Standards | 4 | One column, shared entry grammar, active navigation, and predictable controls are cohesive. |
| 5 | Error Prevention | 3 | Search is forgiving; the public surface has few risky actions. |
| 6 | Recognition Rather Than Recall | 4 | Labels, counts, dates, and current location remain visible. |
| 7 | Flexibility and Efficiency | 2 | Prefetching helps, but browsing offers only text search and pagination. |
| 8 | Aesthetic and Minimalist Design | 3 | The structure is disciplined, but Inter violates the new font direction and weakens authorship. |
| 9 | Error Recovery | 4 | Empty results explain the state and provide a direct recovery action. |
| 10 | Help and Documentation | 3 | The surface is simple, but ordering and journal behavior are implicit. |
| **Total** | | **34/40** | **Good — strong structure, identity and reader-trust issues remain.** |

## Design Specificity Verdict

**LLM assessment:** The card-free list, 44rem column, graphite paper surface, and dotted title/date leaders feel authored for a compact technical journal. The composition is not category-generic. The typography is: Inter makes the interface resemble a polished SaaS/docs template and now directly conflicts with the user's instruction. Replace it rather than pairing it with a decorative second family. **IBM Plex Sans Variable** is the strongest default direction: one self-hosted family, technical without becoming monospace, and more editorially recognizable. **Recursive Sans** is the bolder alternative if more personality is desired.

**Deterministic scan:** The file-local CLI scan reported **0 findings** for `app/pages/Posts/Index.tsx`. Browser detection reported one aggregate page-level finding with nested signals `flat-type-hierarchy`, `layout-transition`, and `dark-glow`. The latter two appear to originate from imported framework CSS and do not match the app stylesheet, so they are treated as false positives. `flat-type-hierarchy` aligns partially with the typography concern, but browser computed evidence—not the detector—is what proves Inter is active.

**Visual overlays:** Mutable script injection succeeded and the browser detector ran, but no user-visible browser presentation surface was available. No reliable human-visible overlay is claimed.

## Overall Impression

The journal already has a confident structural idea. Its biggest opportunity is to stop looking like a beautifully spaced demo and start feeling like a publication with a distinct editorial voice. Replacing Inter is necessary, but typography alone will not repair the credibility break caused by placeholder content and exposed admin/demo framing.

## What's Working

1. **The ledger grammar is memorable.** Dotted leaders, bare rows, dates, and one narrow column create a coherent reading rhythm.
2. **The public task is immediately understandable.** Heading, short description, search, journal list, and pagination form one obvious path.
3. **States and responsive mechanics are unusually complete.** Loading uses `aria-busy`, empty search provides a status and clear action, current navigation is announced, touch targets expand, and desktop/mobile show no horizontal overflow.

## Priority Issues

### [P1] Inter violates the new identity requirement
- **Why it matters:** The implemented type hierarchy is technically competent but visually interchangeable with thousands of product and documentation sites. It suppresses the ledger's otherwise specific personality.
- **Fix:** Remove `@fontsource-variable/inter`, its preload, and all Inter tokens. Test one self-hosted variable family across editorial and Astryx roles. Start with IBM Plex Sans Variable; use Recursive Sans only if a more visibly authored technical voice is desired. Re-tune tracking rather than carrying Inter's negative values across unchanged.
- **Suggested command:** `$impeccable typeset app/pages/Posts/Index.tsx`

### [P1] Placeholder editorial content breaks trust
- **Why it matters:** The first visible entry is `example`, paired with grammatically rough excerpt copy. In a four-entry journal, one weak item defines 25% of the publication and makes the whole surface look unfinished.
- **Fix:** Replace the seed entry with a concise, credible note matching the quality of “A Durable Sentence” and “The Shape of Quiet.” Keep factual demo positioning elsewhere rather than inside the lead editorial slot.
- **Suggested command:** `$impeccable clarify app/pages/Posts/Index.tsx`

### [P2] Public navigation exposes internal/demo architecture
- **Why it matters:** `Admin` has equal visual status with `Journal`, and the footer ends on “Server-driven on Cloudflare Workers.” Readers meet implementation details at both the entrance and emotional endpoint.
- **Fix:** Subordinate Admin access or move it out of primary reader navigation. Replace the implementation footer with a reader-facing endpoint, or make the technical note secondary and contextual.
- **Suggested command:** `$impeccable distill app/components/Layout.tsx`

### [P2] Mobile drops the product's defining title/date relationship
- **Why it matters:** At narrow widths the dotted leader disappears and entries become ordinary stacked title/date/excerpt blocks. The interface remains usable but loses the visual idea that makes it specific.
- **Fix:** Preserve a compact metadata row or subtle ledger rule on mobile. Do not force the desktop leader into insufficient space; adapt the relationship rather than deleting it.
- **Suggested command:** `$impeccable adapt app/pages/Posts/Index.tsx`

### [P2] Story-link affordance is too dependent on hover
- **Why it matters:** Titles are underline-free until hover/focus. The full-row hit area is generous, but touch readers receive no persistent cue that the title opens an article.
- **Fix:** Give titles a restrained permanent affordance: stronger ink/weight contrast, a consistent marker, or a short underline treatment that belongs to the ledger language.
- **Suggested command:** `$impeccable polish app/pages/Posts/Index.tsx`

## Cognitive Load

**2 of 8 checklist failures — moderate, not severe.** The primary task, grouping, visible choices, and recovery are clear; no decision point presents more than four options. Failures: public and administrative concerns compete in the same top navigation, and mobile removal of the ledger relationship weakens rapid scanning. Repeated framing—“Published notes,” count, then “Journal”—is a minor economy issue rather than a blocking load problem.

## Emotional Journey

- **Arrival:** Calm, credible, and unusually restrained.
- **Orientation:** The purpose is clear, but generic typography limits memorability.
- **Selection:** Search and entry scanning are direct; touch affordance is quieter than it should be.
- **Trust:** The `example` seed post is the sharpest emotional valley.
- **Exit:** The implementation-focused footer ends on the demo rather than the journal.

## Persona Red Flags

- **Jordan (First-Timer):** Understands search immediately, but may not recognize unadorned mobile titles as links and may interpret `Admin` as a reader destination.
- **Sam (Accessibility-Dependent):** Benefits from semantic headings, labels, loading announcements, and focus treatment. Small 12–13px gray metadata remains visually fragile near the contrast threshold.
- **Casey (Distracted Mobile User):** Receives 44px touch targets and preserved layout, but the long stacked entries weaken fast one-handed scanning.
- **Ari (Technical Journal Reader):** Expects concise, considered writing. Placeholder copy and the Cloudflare implementation footer make the journal feel like a framework demonstration rather than a publication worth returning to.

## Minor Observations

- Metadata gray is approximately at the AA threshold on paper; it passes narrowly but has little resilience on dim displays.
- The empty state is clear, though `0 published entries`, `Journal`, and `Page 1 of 1` become redundant together.
- Large desktop whitespace is coherent when content is strong; with four entries it sometimes exposes the demo's thinness.

## Questions to Consider

- Is the public product primarily a journal, or should its framework-demo nature remain deliberately visible?
- What should replace the dotted leader's relational role on a 393px screen?
- If the new typeface is the main identity carrier, should it feel engineered and neutral, or visibly authored and idiosyncratic?

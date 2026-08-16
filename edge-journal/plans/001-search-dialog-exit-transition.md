# 001 — Add a graceful search-dialog exit

- **Status**: DONE
- **Commit**: ea1351a
- **Severity**: MEDIUM
- **Category**: Interruptibility / missed opportunity
- **Estimated scope**: 2 source files, approximately 45–65 lines

## Problem

The public search dialog has an Astryx-owned entrance animation, but every dismissal path changes `isSearchOpen` to `false` immediately. Astryx responds by calling the native `dialog.close()` and restoring focus in the same effect, so the surface disappears without an exit transition.

```tsx
// app/pages/Posts/Index.tsx:44-47 — current
const [searchQuery, setSearchQuery] = useState(query);
const [isSearchOpen, setIsSearchOpen] = useState(false);
const [isSearching, setIsSearching] = useState(false);
const visitCounter = useRef(0);
```

```tsx
// app/pages/Posts/Index.tsx:59 — current successful-search dismissal
onSuccess: () => setIsSearchOpen(false),
```

```tsx
// app/pages/Posts/Index.tsx:123-128 — current Dialog ownership
<Dialog
  id="note-search-dialog"
  aria-label="Search notes"
  className="search-dialog"
  isOpen={isSearchOpen}
  onOpenChange={setIsSearchOpen}
```

```tsx
// app/pages/Posts/Index.tsx:141-148 — current close-button dismissal
<IconButton
  type="button"
  label="Close search"
  icon={<CloseIcon />}
  variant="ghost"
  className="dialog-close"
  onClick={() => setIsSearchOpen(false)}
/>
```

Astryx's installed implementation confirms why an app-owned closing phase is required:

```js
// node_modules/@astryxdesign/core/dist/Dialog/Dialog.js:326-332 — evidence only; do not edit
} else {
  if (dialog.open) {
    dialog.close();
  }
  triggerElementRef.current?.focus();
  triggerElementRef.current = null;
}
```

The abrupt disappearance is noticeable because the dialog is an occasional, visually dominant modal surface. The fix must not delay opening, searching, or input feedback; it only bridges the final 225ms between a close request and native closure.

## Target

Keep Astryx `Dialog.isOpen` true while a local closing phase runs. All dismissal sources—close button, Escape, backdrop click, and successful search completion—must call one idempotent close-request function. After the outer dialog's `opacity` transition completes, set `Dialog.isOpen` to false so Astryx performs native closure and restores focus to the search trigger.

Use only compositor-safe properties:

```css
/* target motion token */
[data-astryx-theme="neutral"] {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
}

/* target resting transition */
.search-dialog {
  transition:
    opacity var(--duration-medium-min) var(--ease-out),
    transform var(--duration-medium-min) var(--ease-out);
}

/* target preparation and closing states */
.search-dialog--preparing {
  animation-name: none !important;
}

.search-dialog--closing {
  animation-name: none !important;
  opacity: 0 !important;
  transform: translateY(-4px) scale(0.98) !important;
}

@media (prefers-reduced-motion: reduce) {
  .search-dialog {
    transition: opacity var(--duration-fast) var(--ease-out);
  }

  .search-dialog--closing {
    transform: none !important;
  }
}
```

Exact timing and easing:

- Normal exit: `--duration-medium-min`, currently 225ms in Astryx Neutral.
- Reduced motion: opacity only with `--duration-fast`, currently 125ms.
- Curve: `cubic-bezier(0.23, 1, 0.32, 1)`, the audit playbook's strong UI ease-out.
- Exit endpoint: `opacity: 0`, `translateY(-4px) scale(0.98)`.
- Opening: unchanged; continue using Astryx's existing keyframe and reduced-motion handling.

The transition declarations must remain on the stable `.search-dialog` class, not only on `.search-dialog--closing`. A one-frame `.search-dialog--preparing` phase first releases Astryx's entry keyframe and normalizes the open resting style; the next animation frame applies `.search-dialog--closing`, guaranteeing an opacity transition even when dismissal is requested during the first entry frames.

## Repo conventions to follow

- App-specific visual tokens belong in the existing `[data-astryx-theme="neutral"]` block in `src/styles.css:15-37`.
- The dialog's app-owned surface overrides already live in `.search-dialog` at `src/styles.css:235-242`.
- The stylesheet already uses `!important` narrowly where unlayered StyleX wins the cascade (`margin-inline` and `box-shadow` in `src/styles.css:236-240`). Use `!important` for closing opacity only after confirming it is required to beat Astryx's open-state opacity.
- State remains local to `app/pages/Posts/Index.tsx`; do not introduce global state, a new component package, or a motion dependency.
- Use CSS transitions rather than keyframes for the exit so an interrupted close can retarget from its current value.

## Steps

1. **Preflight the stamped code.** In `edge-journal/`, confirm commit `ea1351a` still contains the cited `Index.tsx` Dialog wiring and `.search-dialog` CSS. If those ownership points have materially changed, stop and report plan drift instead of improvising.
2. **Add the easing token.** In `src/styles.css`, add `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` to the existing `[data-astryx-theme="neutral"]` token block. Do not duplicate Astryx duration tokens.
3. **Declare the stable transition.** Extend `.search-dialog` with explicit `opacity` and `transform` transitions using `var(--duration-medium-min)` and `var(--ease-out)`. Do not use `transition: all`, layout properties, filters, or backdrop animation.
4. **Add the closing modifier.** Add `.search-dialog--closing` with `opacity: 0 !important` and `transform: translateY(-4px) scale(0.98)`. First verify in DevTools that the existing unlayered StyleX open class otherwise wins opacity; remove `!important` only if the cascade demonstrably works without it.
5. **Add reduced-motion behavior.** Inside the existing `@media (prefers-reduced-motion: reduce)` block, make `.search-dialog` transition opacity only for `var(--duration-fast)` with `var(--ease-out)`, and force `.search-dialog--closing { transform: none !important; }`. Keep a short fade because it communicates dismissal without spatial movement.
6. **Add local close-phase state.** In `app/pages/Posts/Index.tsx`, add `isSearchClosePreparing` and `isSearchClosing` next to `isSearchOpen`, plus `searchDialogRef = useRef<HTMLDialogElement | null>(null)`. No new import is required because `useRef` is already imported.
7. **Create one open function.** Define `openSearch` before `visit`. It must clear both close-phase states before setting `isSearchOpen` true, allowing a programmatic reopen to cancel an unfinished exit.
8. **Create one close-request function.** Define `closeSearch` before `visit`. It must return without state changes when the dialog is not open, preparation or closing is already active, or `searchDialogRef.current?.open` is false. Otherwise it sets only `isSearchClosePreparing` to true; it must not set `isSearchOpen` false yet.
9. **Stage the keyframe-to-transition handoff.** Add an effect keyed to `isSearchClosePreparing`. When active, schedule one `requestAnimationFrame` that clears preparation and sets `isSearchClosing` true. Cancel that frame in the effect cleanup so unmounts and canceled closes cannot produce stale updates.
10. **Create one finalizer.** Define `finishSearchClose` so it returns unless `isSearchClosing` is true, then clears both close-phase states and sets `isSearchOpen` false. This final state change permits Astryx to call native `dialog.close()` and restore trigger focus.
11. **Route every close source through `closeSearch`.** Replace the successful visit's `setIsSearchOpen(false)`, the close icon's inline setter, and `Dialog.onOpenChange={setIsSearchOpen}`. The new `onOpenChange` must call `closeSearch` only when Astryx requests `false`; Astryx does not need app handling for a `true` callback.
12. **Route opening through `openSearch`.** Replace the header trigger's inline `setIsSearchOpen(true)` call. Preserve `aria-controls`, `aria-expanded`, `aria-haspopup`, the query-aware label, and all existing trigger styling.
13. **Wire the native dialog element.** Pass `ref={searchDialogRef}` to `Dialog`. Build its class name from the stable `search-dialog` class, `search-dialog--preparing` during the one-frame handoff, and `search-dialog--closing` during the active exit.
14. **Finalize on the correct transition event.** Pass an `onTransitionEnd` handler to `Dialog`. It must return unless all conditions hold: `isSearchClosing` is true, `event.target === event.currentTarget`, and `event.propertyName === "opacity"`. Only then call `finishSearchClose`. These guards prevent child transitions and the simultaneous transform transition from closing early or twice.
15. **Keep entry behavior untouched until dismissal.** Do not alter Astryx package code, trigger-direction CSS custom properties, backdrop styling, autofocus, scroll lock, or focus restoration. The preparation class cancels the entry keyframe only after the user has requested dismissal.

## Boundaries

- Do **not** modify anything under `node_modules/`.
- Do **not** add Framer Motion, Motion, React Spring, GSAP, or another dependency.
- Do **not** alter the search request, Inertia partial reload, query synchronization, loading state, dialog layout, backdrop, or copy.
- Do **not** animate width, height, padding, margin, top, left, border, backdrop blur, or list content.
- Do **not** change the existing Astryx opening animation.
- Do **not** create a general modal abstraction; this plan is local to the journal search dialog.
- If `Dialog` no longer forwards `ref`, arbitrary DOM event props, or `onOpenChange(false)` for Escape/backdrop, stop and report dependency drift.

## Execution outcome

Implemented and independently reviewed. The first direct closing-state implementation failed review because Astryx's active entry keyframe retained transform ownership during rapid dismissal. A subsequent animation-cancellation approach could snap opacity to zero without emitting `transitionend`. The final implementation uses a lifecycle-cleaned one-frame preparation phase, then starts the stable transition from a guaranteed resting style. Browser traces confirmed opacity and transform transitions begin during rapid dismissal, finish before native closure, and preserve trigger focus restoration.

## Verification

- **Mechanical** — from `edge-journal/`:
  1. Run `pnpm typecheck`; expect zero TypeScript errors, including React transition-event typing.
  2. Run `pnpm test`; expect all existing tests to pass.
  3. Remove local `.dev.vars`, run `pnpm build`, and confirm `dist/edge_journal/.dev.vars` does not exist; restore the ignored local development file afterward.
  4. Run the Impeccable detector against `app/pages/Posts/Index.tsx` and `src/styles.css`; expect `[]`.
- **Feel check**:
  1. Open the public journal at desktop and mobile widths. Open search and confirm Astryx's existing entrance is visually unchanged.
  2. Close with the X button. Confirm the dialog fades and moves upward by only 4px while scaling to 0.98, then disappears after 225ms.
  3. Reopen and close with Escape. Confirm the same exit and that focus returns to the header search trigger only after the exit finishes.
  4. Reopen and click the backdrop. Confirm the same exit, no duplicate close, and focus restoration.
  5. Submit a successful search. Confirm loading remains visible while the visit runs, the result state updates, then the dialog performs the same exit rather than vanishing immediately.
  6. Trigger close repeatedly during the 225ms window. Confirm no error, no restart from opacity 1, and no premature native closure.
  7. In Chrome DevTools Animations, set playback to 10%. Confirm only the outer dialog's opacity and transform change; children, backdrop, page content, and layout remain stationary.
  8. Emulate `prefers-reduced-motion: reduce`. Confirm there is no translate or scale, but a 125ms opacity fade remains and focus restoration still occurs afterward.
  9. Inspect computed styles during closing: `opacity` must reach 0, transform must reach `matrix(...)` equivalent to `translateY(-4px) scale(0.98)`, and both normal transitions must resolve to 225ms with `cubic-bezier(0.23, 1, 0.32, 1)`.
- **Done when**: all four close paths share one interruptible exit, native closure happens only after the guarded opacity transition ends, focus reliably returns, reduced motion removes movement but preserves feedback, and the existing opening/search behavior is unchanged.

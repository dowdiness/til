# Astryx performance research

Date: 2026-08-16

Scope: Astryx 0.4.1 in Edge Journal

## Conclusion

The main Astryx-supported opportunity is to replace the pre-built, all-components stylesheet with a **Vite source build** using `@astryxdesign/build/vite`. Astryx describes this as its advanced, leanest-output path: the bundler compiles TypeScript + StyleX source and keeps styles only for imported components. Its reference app reportedly emits roughly one third of the full stylesheet.

Edge Journal already follows Astryx's other two relevant recommendations:

1. Components use direct subpath imports such as `@astryxdesign/core/Button`, which Astryx says keeps bundles small.
2. The app uses the pre-built Neutral theme (`/built` plus `theme.css`), avoiding runtime theme CSS generation.

Therefore, changing import spelling or theme handling is unlikely to materially improve first paint. The next useful experiment is the documented source-build path.

## Current cost and behavior

`src/styles.css` imports:

- `@astryxdesign/core/reset.css`
- `@astryxdesign/core/astryx.css`
- `@astryxdesign/theme-neutral/theme.css`

In the installed 0.4.1 packages, these files contribute:

| Asset | Raw | gzip |
|---|---:|---:|
| Astryx component CSS | 135,715 B | 24,268 B |
| Astryx reset | 11,513 B | 3,636 B |
| Neutral theme CSS | 19,533 B | 3,278 B |

The production application CSS is 169.97 kB raw / 30.47 kB gzip. `astryx.css` is a monolithic pre-compiled file containing all component styles; the package does not expose per-component CSS files. Direct component imports can tree-shake JavaScript, but cannot subset this pre-built stylesheet.

Edge Journal already imports its 13 Astryx categories through direct subpaths. This matches the official Getting Started guidance; there is no remaining barrel-import cleanup in application code.

## Documented optimization path

Astryx officially supports two distribution modes:

- **Pre-built CSS:** simplest setup, but `astryx.css` contains all component styles.
- **Source build:** compile Astryx's TypeScript + StyleX source in the application build so only imported component styles remain.

For Vite, Astryx 0.4.1 provides `@astryxdesign/build/vite`. The plugin wraps the StyleX unplugin, separates Astryx and product class prefixes, and emits them into independent cascade layers. The documented setup requires:

1. Add `@astryxdesign/build`, `@stylexjs/unplugin`, `@stylexjs/babel-plugin`, and `@babel/core` as development dependencies.
2. Add `astryxStylex()` before the React Vite plugin.
3. Alias `@astryxdesign/core` to `node_modules/@astryxdesign/core/src`.
4. Exclude `@astryxdesign/core` and `@astryxdesign/theme-neutral` from Vite dependency pre-bundling.
5. Remove `@astryxdesign/core/astryx.css`; retain the reset and Neutral theme CSS.
6. The official source-build setup uses the bare Neutral theme entrypoint. Edge Journal retains `/built` because Cloudflare's development Worker introspection evaluates the bare entrypoint's `defineVars` before StyleX transforms; the static theme CSS remains the same.
7. Preserve modern Lightning CSS/browser targets because Astryx tokens use native `light-dark()`.

Edge Journal's existing `src/styles.css` can serve as the CSS asset into which StyleX output is aggregated, so the placeholder stylesheet used by Astryx's minimal Vite example should not be necessary.

## Expected impact

The official “roughly one third” result belongs to Astryx's reference app, not Edge Journal. It must not be treated as a forecast. Still, because Edge Journal uses 13 component categories rather than the full library, source compilation should substantially reduce the 24.3 kB gzip component-CSS portion.

A reasonable experiment target is:

- materially less than 135.7 kB raw Astryx component CSS;
- total initial CSS below 20 kB gzip;
- lower cold FCP/LCP than the current 899 ms under Fast 4G and 4× CPU throttling;
- no regression to SSR output, hydration, theme scoping, or unsupported-browser fallbacks.

Only before/after production traces can establish the actual saving. The source-build setup adds build complexity and the official Vite example is a client-only React app, so compatibility with Cloudflare's multi-environment Vite build and Inertia SSR must be proven in a branch or reversible prototype before adoption.

## Options not worth pursuing first

- **More direct imports:** already complete.
- **Per-component CSS imports:** not exported by Astryx 0.4.1.
- **Removing the Theme provider:** not the documented optimization. The current built theme already skips runtime CSS injection and maintains theme context and root attributes.
- **Manual extraction from `astryx.css`:** unsupported and tightly coupled to generated internal classes.
- **Swizzling components:** intended for ownership/customization, not routine bundle reduction, and increases maintenance responsibility.
- **Critical-CSS tooling:** Astryx documents no dedicated critical-CSS command. Source compilation should be measured before introducing custom extraction.

## Recommended experiment

Create a reversible source-build prototype, then compare against the existing production build:

1. Baseline CSS/JS output and cold mobile trace.
2. Apply the official Vite source-build configuration.
3. Verify both client and Worker builds.
4. Check public SSR HTML, hydration, search dialog, article navigation, admin CSR, and theme attributes.
5. Compare CSS bytes, FCP, LCP, CLS, TBT, Worker bundle size, and cold TTFB.
6. Keep the change only if the measured rendering improvement justifies the added build pipeline.

## Verified result

The source-build optimization was applied and retained based on measured improvement. Production build required a Cloudflare compatibility adaptation: the `@stylexjs/unplugin` `config` hook is dropped because it is redundant with the Cloudflare Vite plugin, while the `astryxStylex` config plugin retains the required aliases and dependency-prebundling excludes. Development continues to load pre-built component CSS because Astryx source uses `defineVars`, which fail during Worker introspection in dev.

Final comparison (cold mobile Fast 4G / 4× CPU slowdown, same public FCP/LCP target):

| Metric | Before | After |
|---|---:|---:|
| Application CSS raw | 169.97 kB | 104.79 kB |
| Application CSS gzip | 30.47 kB | 19.67 kB |
| Public FCP/LCP | 899 ms | 726 ms |
| TBT proxy | 109 ms | 78 ms |
| TTFB (final run) | 60 ms | 48 ms |
| CLS | 0.02 | 0.02 |

Lighthouse accessibility, best practices, SEO, and agentic all score 100. Typecheck, 22 tests, client + edge build, dev server, SSR/hydration, and public/dialog/article/admin visuals passed.

## Primary sources

- [Astryx Getting Started — theme CSS and direct component imports](https://astryx.atmeta.com/docs/getting-started)
- [Astryx: How Astryx works — pre-built versus source builds](https://astryx.atmeta.com/blog/how-astryx-works)
- [`@astryxdesign/build` 0.4.1 README — Vite source-build setup](https://github.com/facebook/astryx/blob/v0.4.1/packages/build/README.md)
- [Astryx 0.4.1 Vite example](https://github.com/facebook/astryx/tree/v0.4.1/apps/example-vite)
- [`@astryxdesign/theme-neutral` 0.4.1 README](https://github.com/facebook/astryx/blob/v0.4.1/packages/themes/neutral/README.md)
- Installed 0.4.1 package manifests and generated CSS under `node_modules/@astryxdesign/core` and `node_modules/@astryxdesign/theme-neutral` (used for the local byte measurements)

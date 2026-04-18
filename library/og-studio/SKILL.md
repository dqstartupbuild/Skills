---
name: og-studio
description: Generate Open Graph images for shareable pages of a web app, either as committed static assets or framework-native metadata routes such as Next.js `opengraph-image.tsx`, and wire page metadata to the new assets. Use when replacing existing og:image or twitter:image files, adding route-level social preview images, or migrating a repo to structured Open Graph image handling. Triggers on Open Graph, og:image, Twitter card images, opengraph-image.png, opengraph-image.tsx, social preview images, metadata images, and page preview assets.
---

# Open Graph Images

## Overview

Create social preview images for real application pages, either as committed static assets or framework-native code routes, and wire the app so each page resolves to the new asset. The output is committed repo state, not browser downloads or temporary files.

## Core Principle

**Generate into the repository and the framework's metadata conventions, not the browser.** The task is only complete when the final files or route handlers live in framework-correct paths and the application metadata resolves to them.

Default to a **review-first workflow** when the repo does not already have a deterministic OG pipeline. Let the user preview and approve cards before wiring them into metadata.

## Step 1: Gather the Minimum Inputs

Before changing code, determine these inputs from the user or the repo:

1. **Brand anchors**: logo/icon path, primary brand colors, preferred font if the app already has one
2. **Page scope**: all public pages or a subset
3. **Style direction**: minimal/editorial, bold gradient, dark, playful, enterprise, or "match the site"
4. **Copy source**: page titles, headings, and value props already present in the repo
5. **Current system**: whether the repo already has OG/Twitter assets or metadata wiring

If 1-3 cannot be inferred reliably, ask one concise question. Everything else should come from repository inspection.

## Step 2: Inventory Routes and Existing OG Wiring

Use the bundled helper first:

```bash
python3 scripts/detect_og_targets.py /path/to/repo > /tmp/og-targets.json
```

The helper reports:

- framework guess
- route candidates
- existing `opengraph-image.*` and `twitter-image.*` files
- `public/og/*` assets
- files that already contain OG/Twitter metadata wiring
- the recommended workflow
- the most likely output strategy

Treat the script output as a starting point, not a substitute for judgment. Manually prune:

- admin/settings/dashboard internals
- auth/login/logout/callback routes
- API routes
- error/loading/template/not-found routes
- large dynamic sets unless the framework can support a code-generated metadata route cleanly

Default target set:

- homepage
- pricing
- product/feature pages
- docs landing pages and major docs sections
- blog index and high-value evergreen pages

### Shell Hygiene for Real Route Paths

Many repos use Next App Router route groups like `(info)` and dynamic segments like `[slug]`. In `zsh`, unquoted paths containing `(`, `)`, `[`, or `]` can fail before the command even runs.

Always quote these paths in shell commands:

```bash
sed -n '1,80p' 'app/(info)/pricing/page.tsx'
sed -n '1,120p' 'app/(content)/blog/[slug]/page.tsx'
rg -n "createPageMetadata" 'app/(info)' 'app/(content)'
```

Do not treat `zsh: no matches found` as a repository problem until you have retried with quoted paths.

## Step 3: Choose the Integration Strategy

### Default Recommendation Matrix

Use this as the default decision table unless the user explicitly asks for a one-shot auto-wiring flow:

| Repo shape | Default workflow | Static page connection | Dynamic page connection |
|------------|------------------|------------------------|-------------------------|
| Next App Router with only stable public pages | Review hub first | `Import` / `Import All` into the existing static system | N/A |
| Next App Router with stable pages plus slug routes | Review hub for stable pages plus dynamic route apply | `Import` / `Import All` | `Apply Dynamic Route` writes `opengraph-image.tsx` |
| Next Pages Router / Astro / Remix / Vite | Review hub first | `Import` / `Import All` into `public/og` or existing metadata helper | Use helper or fallback unless the framework has an equivalent dynamic metadata route |
| Repo already has a mature OG pipeline | Extend existing system | Preserve the current import/wiring shape | Preserve the current dynamic route/helper shape |

### Preferred UX: Review Hub Before Wiring

For most repos, especially when style and copy may still change, prefer building a local-only **OG Hub** first instead of immediately wiring generated images into metadata.

The hub should:

- display every target card in one grid
- support per-target preview at thumbnail size and full-size view
- support per-target `Import` buttons
- support `Import All`
- keep generated outputs staged until the user imports them
- make it obvious which targets are already imported versus still staged

Use this pattern for:

- stable marketing pages
- docs landing pages
- blog index and other small public route sets

Do not force auto-wiring unless the user explicitly asks for a one-shot workflow or the repo already has an approved deterministic generator.

### Static Import Semantics

For static asset systems, `Import` means:

1. render or capture the selected card
2. write it to the final repo path
3. update metadata references if they are not already wired
4. mark the target as imported in the hub UI

`Import All` does the same for every staged target.

If the user wants to tweak copy, accent, badges, or artwork before wiring, keep those edits inside the hub state or the underlying target config until import is confirmed.

### Dynamic Route Semantics

For dynamic Next App Router systems using `opengraph-image.tsx`, the hub should not behave like one-image-per-slug import.

Instead, the hub should:

- preview the shared dynamic card template
- let the user switch among sample slugs
- let the user edit the template or route-level rendering logic
- offer an `Apply Dynamic Route` action that writes or updates `opengraph-image.tsx`
- optionally offer `Apply All Static Imports` separately for stable non-dynamic pages

For dynamic routes, the “connection” step is wiring the route handler once, not importing hundreds of generated PNG files.

### Exact Hub Architecture

When implementing the review-first flow, prefer this exact layout unless the repo already has a better equivalent:

```text
src/app/og-studio/page.tsx                     # local-only shell route
src/app/og-studio/OgStudioClientPage.tsx       # grid, preview, import controls
src/app/og-studio/client-utils.ts              # html-to-image capture helpers
src/app/og-studio/[key]/page.tsx               # local-only full preview route
src/app/og-studio/[key]/OgStudioPreviewClient.tsx
src/app/api/og/import/route.ts                 # POST-only import endpoint
src/lib/og/targets.ts                          # canonical OG definitions and imported-state lookup
src/lib/og/card.tsx                            # browser-safe shared card renderer
src/lib/og/importer.ts                         # writes PNG buffers into final repo paths
src/lib/og/renderers.tsx                       # optional next/og helpers for dynamic routes
```

Use these responsibilities:

- `page.tsx`: local-only gate and lightweight shell that groups targets for the hub
- `OgStudioClientPage.tsx`: toolbar, grid, staged/imported status, per-card `Preview` and `Import`
- `client-utils.ts`: wait for fonts and images, capture the exact DOM preview with `html-to-image`, POST the PNG to the server
- `app/api/og/import/route.ts`: accept `{ key, dataUrl }` and write the browser-captured PNG into the repo
- `[key]/page.tsx` and `OgStudioPreviewClient.tsx`: local-only full-size preview route for one target
- `targets.ts`: which routes exist, which output paths they map to, and whether each target is already imported
- `card.tsx`: canonical browser-safe card tree used by the studio preview
- `importer.ts`: final file writes only; no second renderer for static imports
- `renderers.tsx`: optional `ImageResponse` helpers for dynamic `opengraph-image.tsx` routes, kept separate from static studio imports

For static imports, do not use server actions or a second image renderer by default. Preview in the browser, capture that exact preview, and write the PNG through a local POST route.

### Strategy A: Next.js App Router with Route-Local Static Assets

Use this when the repo has `app/` or `src/app/` routes.

Write static assets next to the route segment:

- root route: `app/opengraph-image.png`
- nested route: `app/pricing/opengraph-image.png`
- add `twitter-image.png` only when the repo already uses route-local Twitter assets or the user wants separate Twitter variants

Prefer replacing existing route-local assets in place.

### Strategy B: Next.js App Router Dynamic Metadata Routes

Use this for dynamic content collections such as `/blog/[slug]`, `/compare/[slug]`, `/docs/[...slug]`, or any route where each record should get its own OG card automatically.

Prefer this over generating and committing one PNG per slug.

Write route-local metadata files inside the dynamic segment:

- `app/blog/[slug]/opengraph-image.tsx`
- `app/blog/[slug]/twitter-image.tsx` only if the repo already expects separate Twitter variants

Use `ImageResponse` from `next/og` and the same content loader or data source the page already uses. The generated image should pull the real slug title/subtitle rather than duplicating another source of truth.

Next.js behavior to rely on:

- `opengraph-image.tsx` is a special metadata route and updates the route segment automatically
- generated images are statically optimized by default unless they use Dynamic APIs or uncached data
- the more specific segment wins over parent metadata files

For mixed systems, use:

- static assets for stable marketing pages
- `opengraph-image.tsx` for high-volume dynamic records
- one shared fallback only when unique per-record cards are not worth the complexity

### Strategy C: Static Assets Under `public/og`

Use this for Next.js pages router, Astro, Remix, Vite SPAs, and custom React apps that wire metadata in code.

Write stable files such as:

- `public/og/home.png`
- `public/og/pricing.png`
- `public/og/docs-getting-started.png`

Then point each page's `og:image` and `twitter:image` fields to those assets.

### Strategy D: Extend the Existing OG System

If the repo already has a clear OG image system, extend it instead of inventing a second one.

Examples:

- existing `public/og/*.png` plus SEO helper: keep that structure and swap in new files
- existing root-level `public/og-image.png` plus metadata helper: treat it as the shared fallback and extend around it
- existing route-local `opengraph-image.png`: regenerate those exact files
- existing route-local `opengraph-image.tsx`: keep that route-local dynamic model and improve the card output instead of replacing it with static files
- existing `getSeo()` / `buildMetadata()` helper: feed new paths through the helper

**Never** add both route-local assets and a new `public/og` structure for the same pages unless the repo already deliberately uses both.

## Step 4: Build the Generator Inside the Repo

Prefer a local-only OG studio inside the app when the stack is React-, Next-, or Astro-based and visual consistency matters.

Recommended structure for static asset generation and review-first flows:

```text
src/app/og-studio/page.tsx
src/app/og-studio/OgStudioClientPage.tsx
src/app/og-studio/client-utils.ts
src/app/og-studio/[key]/page.tsx
src/app/og-studio/[key]/OgStudioPreviewClient.tsx
src/app/api/og/import/route.ts
src/lib/og/card.tsx
src/lib/og/importer.ts
src/lib/og/targets.ts
```

Rules:

- In Next App Router, do not put a routable studio under a leading-underscore folder such as `_og-studio` or `__og-studio`. Underscore-prefixed folders are private and opt out of routing.
- Keep the generator route local-only unless the user explicitly asks to publish it.
- Use one fixed canvas size: `1200x630`.
- Use one shared design system with a few layout variants instead of one-off templates.
- Pull copy from real page content whenever possible.
- Write images directly to their final repo paths.
- If the studio is local-only, gate it deliberately with host checks or environment checks instead of relying on a private folder name.
- If using a hub, keep the route thin and move the interactive grid and import interactions into `OgStudioClientPage.tsx`.
- For static imports, keep the preview renderer and the final imported PNG on the same path by capturing the real browser preview node.

### Hub Interaction Model

When building a review hub, prefer this UI model:

- a toolbar with `Import All`, imported count, and a short status message
- a responsive grid of OG cards
- each card shows route label, output path, and current status: `staged` or `imported`
- each card offers `Preview` and `Import` or `Re-import`
- preview uses the real 1200x630 browser render, scaled down in the grid
- imported status comes from final file existence and metadata wiring, with local optimistic UI after import

Do not add a separate `Generate` or `Regenerate` lane by default. The staged preview is the live browser render, and `Import` writes that exact preview into the repo.

### Import Route Contract

Implement the static import path with a local POST route, not a GET helper:

- `POST /api/og/import`
- request body: `{ key: string, dataUrl: string }`
- response body: `{ imported: number, results: [{ key, outputPath, absolutePath }] }`

Static import semantics:

- `Import(targetKey)`: capture the selected browser preview, POST it, write or replace the final PNG, and keep metadata aligned
- `ImportAll()`: capture and import every staged static target in sequence

If the repo also needs dynamic-route application, expose that through a separate action or route. Do not mix static browser-capture imports and dynamic `opengraph-image.tsx` application into the same handler.

### Preferred Capture Method

For a static OG studio, prefer browser DOM capture of the exact preview node with `html-to-image`.

Typical split:

- preview rendering in the browser via React
- final import writing through a local POST route

Typical capture pattern:

```ts
await document.fonts.ready;
const dataUrl = await toPng(node, {
  width: 1200,
  height: 630,
  pixelRatio: 1,
  cacheBust: true,
  style: {
    transform: "none",
    transformOrigin: "top left",
  },
});
await fetch("/api/og/import", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ key, dataUrl }),
});
```

Before capture:

- wait for `document.fonts.ready`
- wait for every `<img>` inside the preview node to finish loading
- ensure each card renders at exactly `1200x630`
- if the in-grid preview is scaled down, override the transform during capture so the saved PNG is full size
- set an intentional background so the output never depends on transparency fallback

Do not preview with one renderer and import with another for static targets. If the studio preview is browser-rendered, the imported PNG should come from that same browser render.

Use Playwright only as a fallback for non-studio automation or batch jobs where no interactive review hub exists.

### Local Dev Server Hygiene

If a generation script boots a local dev server:

- use a configurable port such as `OG_PORT`
- if the environment blocks local port binding or dev-server startup, request the needed approval before changing the implementation
- check whether that port is already occupied before retrying a failed run
- avoid starting a second generator while the first one is still running
- if Next reports a stale dev lock, confirm the original process is dead before removing the lock file
- after an interrupted run, inspect active processes and lockfiles before declaring the workflow broken

## Step 5: Design Rules for the Cards

- One page, one message
- Treat the image as a poster, not a page screenshot
- Keep text large and scannable at thumbnail size
- Reuse the app's visual language instead of inventing a parallel brand
- Use at most 2-4 layout variants across the entire set

Good composition ingredients:

- product mark or logo
- page label or section kicker
- one strong headline
- optional short subline
- restrained background gradient, pattern, or shape

Typical framing by page type:

- home: flagship promise
- pricing: straightforward pricing/sales framing
- feature page: one specific outcome
- docs: docs label plus section title
- blog/article: article title, optionally author/date only if it improves clarity
- dynamic content page: real record title first, optional taxonomy/author/date only if it helps the thumbnail scan faster

Avoid:

- tiny UI screenshots
- crowded grids
- multiple competing messages
- decorative noise that overpowers the text

## Step 6: Write Files to Final Paths

Generate directories before capture. Do not route outputs through Downloads, Desktop, or temp folders unless a later script immediately moves them into place in the same change.

Slug rules for `public/og`:

- `/` -> `home.png`
- `/pricing` -> `pricing.png`
- `/docs/getting-started` -> `docs-getting-started.png`

Rules for replacing existing assets:

- overwrite in place when the current paths are already correct
- if filenames or structure change, update every reference in the same change
- remove obsolete duplicates only after verifying nothing points to them

## Step 7: Wire Metadata into the App

If the project uses a review hub, wiring should happen at import time, not as soon as the preview exists.

### Next.js App Router

If route-local `opengraph-image.png` is used, Next will usually pick it up automatically. Still inspect:

- `metadata`
- `generateMetadata`
- parent layouts
- any hard-coded `openGraph.images` or `twitter.images`

If those overrides still point to old assets, update or remove them so the route-local file wins.

For dynamic segments in App Router, prefer `opengraph-image.tsx` over a static fallback when each slug should render its own card automatically. Keep the image route next to the dynamic page so the slug params and data loader stay local to the route segment.

If a hub is present, the import/apply behavior should be split:

- stable routes: `Import` writes the final asset and connects metadata
- dynamic routes: `Apply Dynamic Route` writes or updates `opengraph-image.tsx`

### Next.js Pages Router

Update the shared SEO system or page-level metadata to point at `/og/...png`.

Check:

- `next-seo.config.*`
- shared `SEO` components
- `next/head` usage
- metadata helpers in `lib/seo*`, `utils/seo*`, or similar

### Astro / Remix / Vite / Custom React

Find the abstraction that owns `<meta property="og:image">` and `<meta name="twitter:image">`. Only change image fields unless the user explicitly asks for broader SEO cleanup.

### Twitter Cards

If the repo already uses Twitter card tags, keep them aligned with the new OG assets. Reuse the same PNG by default unless the repo already expects separate Twitter image files.

## Step 8: Replace Current OG Images Safely

- Prefer in-place replacement over path churn
- If the current filenames are stable and already wired, regenerate those exact filenames
- If migrating to a cleaner structure, update all callers in the same patch
- Do not delete old files until reference search confirms zero callers

Useful search:

```bash
rg -n "og:image|twitter:image|openGraph|twitter.*images|opengraph-image|/og/" /path/to/repo
```

After changing metadata helpers or image variables, also search for stale symbol references and structured data blocks that still point at the old image:

```bash
rg -n "ogImageUrl|twitterImageUrl|ImageObject|image:" /path/to/repo
```

## Step 9: Verify Before Finishing

1. Confirm every target PNG exists at its final repo path
2. Confirm every target page points to the new asset or inherits it correctly
3. Search for stale OG/Twitter references
4. Run the app and inspect one representative page per route family
5. Verify rendered head output if the framework exposes it locally
6. If App Router dynamic metadata routes were added, request at least one real slug and confirm the route returns an image successfully
7. If metadata helpers were refactored, confirm JSON-LD or structured data blocks do not still reference the previous image variable
8. Do not claim success if the only outputs exist in a temp directory or browser downloads

For hub-based flows also verify:

9. imported cards are visually distinguished from staged cards
10. `Import` updates only the selected target
11. `Import All` updates every staged static target exactly once
12. dynamic-route preview and static-import flows are not conflated in the same button

## Route Selection Rules

Default include:

- homepage
- pricing
- feature/product pages
- docs overview pages
- blog index and evergreen pages
- about/contact/legal only when clearly public and useful

Default exclude:

- API routes
- admin/settings/dashboard internals
- auth/login/logout/callback
- loading/template/error/not-found routes
- user-specific dynamic record pages

Ask before including very large dynamic sets such as `/blog/[slug]`, `/docs/[...slug]`, or `/products/[id]` if the repo would need dozens or hundreds of committed assets.

For Next.js App Router, do not default those routes to static asset fan-out. Prefer `opengraph-image.tsx` in the dynamic segment when the route data already exists and unique per-record cards are desired.

## Helper Script

Use `scripts/detect_og_targets.py` from this skill folder to inventory:

- framework family
- routing style
- candidate routes
- existing OG/Twitter assets
- metadata hint files
- recommended output strategy

Treat its output as advisory. You still need to inspect the repo and choose the cleanest migration path.

## Reference Artifacts

Use these bundled resources instead of re-inventing the same hub structure each time:

- Next App Router hub guidance: [references/next-app-router-og-hub.md](references/next-app-router-og-hub.md)
- Next App Router template skeleton: `assets/next-app-router-og-hub/`

The template asset pack includes:

- `app/og-studio/page.tsx.example`
- `app/og-studio/OgStudioClientPage.tsx.example`
- `app/og-studio/client-utils.ts.example`
- `app/og-studio/[key]/page.tsx.example`
- `app/og-studio/[key]/OgStudioPreviewClient.tsx.example`
- `app/api/og/import/route.ts.example`
- `lib/og/card.tsx.example`
- `lib/og/importer.ts.example`
- `lib/og/targets.ts.example`
- `app/blog/[slug]/opengraph-image.tsx.example`

Use the reference doc first to choose the right workflow. Copy or adapt template files only after confirming the target repo is Next App Router and the user wants the hub-first pattern.
These are intentionally stored as `*.example` files so this skill repository does not try to typecheck Next.js template code outside a Next.js app. Rename them back to their real filenames when copying into the target repo.

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Generated files land in Downloads | Write directly to repo paths through the local import route; do not rely on browser downloads |
| A second OG system is added beside the first | Extend the existing wiring instead of duplicating it |
| Every route gets an image, including admin/auth/api | Filter to canonical public pages |
| The agent wires images immediately before the user can review them | Build an OG hub with staged previews, `Import`, and `Import All` as the default workflow |
| The preview looks right but the imported PNG looks different | Capture the real browser preview with `html-to-image` and POST that PNG to the server instead of re-rendering it through another engine |
| A hub treats dynamic `opengraph-image.tsx` routes like static PNG imports | Use preview plus `Apply Dynamic Route`; do not pretend every slug needs a committed file |
| `zsh: no matches found` on `(group)` or `[slug]` paths | Quote the path before assuming the file is missing |
| A Next studio route is placed under `_og-studio` or `__og-studio` and never resolves | Use `og-studio` or a route group plus a normal segment; underscore folders are private |
| Text is tiny or the design is screenshot-heavy | Treat the image as a poster, not a UI capture |
| `og:image` changes but `twitter:image` still points to the old file | Keep both tags aligned |
| Route-local Next assets exist but metadata overrides still win | Remove or update the overrides |
| A repo already has `public/og-image.png` and the agent misses it | Treat root-level public OG files as part of the existing system and extend them deliberately |
| Old `public/og` files remain after migration | Delete only after zero-reference verification |

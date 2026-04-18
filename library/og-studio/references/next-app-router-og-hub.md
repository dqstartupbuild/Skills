# Next App Router OG Hub

Use this reference when the target repo uses Next App Router and the user wants a review-first OG workflow instead of immediate rewiring.

## When To Use The Hub

Use the hub when:

- the repo has a manageable set of stable public pages
- the user wants to review copy or visuals before import
- the existing OG system is static or helper-based
- the repo also has dynamic slug routes and you want to keep those separate

Do not force the hub when:

- the repo already has a mature OG workflow the team trusts
- the user explicitly wants a one-shot auto-wiring flow
- the task is only to patch an existing `opengraph-image.tsx`

## Two Lanes

Treat the implementation as two separate lanes:

1. Static lane
   Import staged previews into final asset paths and connect metadata.
2. Dynamic lane
   Preview sample slugs, then write `opengraph-image.tsx` once.

Do not collapse both lanes into one button.

## Minimum File Set

Prefer this minimum file set:

```text
app/og-studio/page.tsx
app/og-studio/OgStudioClientPage.tsx
app/og-studio/client-utils.ts
app/og-studio/[key]/page.tsx
app/og-studio/[key]/OgStudioPreviewClient.tsx
app/api/og/import/route.ts
lib/og/card.tsx
lib/og/importer.ts
lib/og/targets.ts
app/blog/[slug]/opengraph-image.tsx
```

In this skill repository, the bundled template assets are stored as `*.example` files so they do not get typechecked as live Next.js code. Rename them back to their real filenames when copying them into a target app.

## Status Model

Each target should expose:

- `key`
- `route`
- `label`
- `dynamic`
- `outputPath`
- `sampleParams` for dynamic previews when needed

Each card should show one of:

- `staged`
- `imported`
- `out_of_date`

Prefer deriving `imported` from final file existence and known metadata wiring rather than trusting client state alone.

## Import Model

For static targets, use the browser-capture import flow:

- preview is rendered in the browser from the real card component tree
- `Import` captures that exact DOM node with `html-to-image`
- the client POSTs `{ key, dataUrl }` to `/api/og/import`
- the server writes the PNG into the final repo path

If the repo also needs dynamic-route application, keep that as a separate action or route. Do not combine it with the static browser-capture import path.

## Preview Model

For static targets:

- render the same card tree the final screenshot will capture
- show the 1200x630 preview in-grid
- capture that same preview node at import time with `html-to-image`
- wait for fonts and nested images before capture
- if the grid preview is scaled, remove the transform during capture so the saved PNG is still 1200x630

For dynamic targets:

- preview the same shared card/template function used by `opengraph-image.tsx`
- allow switching among sample slugs
- validate that the route handler can access the same source of truth as the page

Do not preview with a browser renderer and then import through `ImageResponse` or another second renderer for static targets. That creates preview/import drift.

## Wiring Model

Static targets:

- final file write
- metadata helper update if needed
- optional fallback image update if the repo uses one

Dynamic targets:

- write `opengraph-image.tsx`
- verify at least one real slug
- keep static imports unchanged

## Common Failure Prevention

- Quote route-group and dynamic-segment paths in shell commands.
- Do not put a routable hub under `_og-studio` or `__og-studio`.
- If the repo already has `public/og-image.png`, treat it as part of the existing system.
- Search for stale metadata variables like `ogImageUrl` after refactors.
- If a local server or Playwright run is interrupted, inspect ports and lockfiles before retrying.
- If the preview looks right but the imported PNG looks wrong, remove the second renderer and import the exact browser preview instead.

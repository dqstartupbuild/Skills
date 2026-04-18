# Architecture Map

Use this file when you need the recommended file layout and responsibility split.

## Core Files

| File | Responsibility |
| --- | --- |
| `package.json` | Declares the content build step and wires `content:build` into typecheck, tests, or build safeguards. |
| `scripts/build-content-collections.mjs` | Runs the content-collections builder. |
| `content-collections.ts` | Defines MDX collections, validates frontmatter, compiles MDX, and returns typed `url` fields. |
| `lib/site.ts` | Stores `siteUrl`, core metadata constants, and OG path/url helper functions. |
| `lib/og/server-resolver.ts` | Resolves a route-specific OG asset from `public/og/*.png` and falls back to the default OG image when missing. |
| `lib/metadata.ts` | Generates reusable non-content page metadata from a relative canonical path. |
| `next.config.ts` | Applies the site's CSP and shared security headers, preserves content plugin integration, and holds any site-wide rewrites. |
| `app/layout.tsx` | Defines root `metadata` and injects global JSON-LD. |

## Content Layer

| File | Responsibility |
| --- | --- |
| `lib/content/schema.ts` | Defines the shared frontmatter contract with Zod plus any collection-specific extensions. |
| `lib/content/queries.ts` | Filters drafts, sorts by date, exposes lookup helpers, builds taxonomy entries, and computes related content. |
| `lib/content/seo.ts` | Generates article metadata, FAQ JSON-LD, article JSON-LD, and RSS XML. |
| `lib/llms.ts` | Stores the shared facts/context block and generates the `llms.txt` response body from that source of truth. |
| `content/README.md` | Documents authoring rules, required frontmatter, and approved MDX components. |
| `content/blog/*.mdx` | Stores the actual blog source files with absolute canonicals and SEO metadata. |
| `content/comparisons/*.mdx` | Optional second SEO collection that reuses the same content architecture. |

## Route Surfaces

| File | Responsibility |
| --- | --- |
| `app/(content)/layout.tsx` | Wraps blog and other content pages in a shared shell. |
| `app/(content)/blog/page.tsx` | Renders the blog index page and uses `createPageMetadata(...)`. |
| `app/(content)/blog/[slug]/page.tsx` | Generates static params, page metadata, JSON-LD, and renders compiled MDX for each article. |
| `app/feed.xml/route.ts` | Returns RSS XML built from published blog posts. |
| `app/llms.txt/route.ts` | Returns the plain-text `llms.txt` response using `createLlmsTxt()` with cache headers. |
| `app/sitemap.ts` | Emits sitemap entries for static pages plus every published content URL. |
| `app/robots.ts` | Emits crawl rules plus a sitemap reference. |
| `app/api/indexnow/route.ts` | Optional indexing helper adjacent to the discovery layer. |

## Test Coverage Patterns

| File | Responsibility |
| --- | --- |
| `lib/metadata.test.ts` | Verifies canonical URL, OG URL, Twitter image, and shared metadata wiring. |
| `lib/content/schema.test.ts` | Verifies valid and invalid frontmatter shapes. |
| `lib/content/seo.test.ts` | Verifies content metadata, FAQ JSON-LD, article JSON-LD, and RSS output. |
| `lib/llms.test.ts` | Verifies `llms.txt` stays aligned with the shared fact entries and required sections. |
| `app/sitemap.test.ts` | Verifies sitemap coverage for dynamic URLs. |

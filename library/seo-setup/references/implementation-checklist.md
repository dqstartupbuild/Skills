# Implementation Checklist

Use this file first when applying the skill.

## 1. Add the Build Stack

1. Add the content dependencies you plan to use:
   - `@content-collections/core`
   - `@content-collections/mdx`
   - `remark-gfm`
   - `zod`
2. Add `scripts/build-content-collections.mjs` that runs the content-collections builder.
3. Add `content:build` to `package.json`.
4. Run `content:build` before tests and typecheck so generated content types stay current.

## 2. Create the Metadata Foundation

1. Create `lib/site.ts` as the single source of truth for:
   - site origin
   - site title and description
   - brand/publisher constants
   - OG route-to-file helpers
2. Create `lib/og/server-resolver.ts` so route metadata resolves a matching `public/og/*.png` file when it exists and falls back when it does not.
3. Create `lib/metadata.ts` for generic page metadata that accepts:
   - `title`
   - `description`
   - `canonical`
   - optional `keywords`
4. Update `app/layout.tsx` to:
   - set root metadata
   - define `metadataBase`
   - emit root-level JSON-LD
   - keep the global `alternates.canonical`

## 3. Add the Security and Discovery Layer

1. Create or update `next.config.ts` to keep the central header pattern:
   - define a `contentSecurityPolicy` array and join it into one header string
   - define a `securityHeaders` array
   - apply those headers through `async headers()` for `/:path*`
2. Start from this CSP shape unless the user explicitly wants a stricter or different policy:
   - `default-src 'self'`
   - `base-uri 'self'`
   - `frame-ancestors 'self'`
   - `form-action 'self'`
   - `object-src 'none'`
   - `script-src 'self' 'unsafe-inline' 'unsafe-eval'` plus any explicitly approved script hosts
   - `style-src 'self' 'unsafe-inline'`
   - `img-src 'self' data: blob: https:`
   - `font-src 'self' data:`
   - `frame-src 'self'` plus any explicitly approved embed hosts
   - `connect-src 'self' https: ws: wss:` plus any explicitly approved API, analytics, or websocket hosts
   - `worker-src 'self' blob:`
3. Apply the same small security header set:
   - `Content-Security-Policy`
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
4. Keep `llms.txt` content in a helper such as `lib/llms.ts`, then expose it through `app/llms.txt/route.ts`.
5. Keep `robots.ts` and `sitemap.ts` driven by shared helpers and site constants.

## 4. Create the Content Pipeline

1. Create `content-collections.ts`.
2. Define at least the `blog` collection under `content/blog`.
3. Compile MDX with `remark-gfm`.
4. Return typed `url` fields from the transform so route components do not reconstruct them manually.
5. Create `lib/content/schema.ts` with the shared frontmatter contract.
6. Create `content/README.md` so authors know the required fields and MDX rules.
7. Encode the editorial metadata rules in the content contract:
   - `seoTitle`: 50-70 characters
   - `description`: 110-170 characters
   - `title`: may be longer than `seoTitle`
8. If the repo already has `AGENTS.md` and/or `README.md`, update them with these rules and the blog/SEO architecture. If not, create one of them so the setup is documented for future contributors.

## 5. Centralize Content Logic

1. Create `lib/content/queries.ts` for:
   - draft filtering
   - date sorting
   - slug lookups
   - recent posts
   - related content
   - taxonomy helpers if needed
2. Create `lib/content/seo.ts` for:
   - `createContentMetadata(...)`
   - FAQ JSON-LD helper
   - article JSON-LD helper
   - optional comparison JSON-LD helper
   - RSS XML generation

## 6. Build the Blog Surface

1. Create `app/(content)/layout.tsx` for the shared content shell.
2. Create `app/(content)/blog/page.tsx`:
   - list published posts
   - use `createPageMetadata(...)`
3. Create `app/(content)/blog/[slug]/page.tsx`:
   - export `generateStaticParams()`
   - export `generateMetadata(...)`
   - render compiled MDX
   - inject page-level JSON-LD
4. Keep the page thin; pull heavy logic from helpers instead of inlining it.

## 7. Add SEO Output Routes

1. Create `app/feed.xml/route.ts` and return RSS from shared helpers.
2. Create `app/sitemap.ts` and include:
   - home page
   - blog index
   - each published blog post
   - any other SEO landing pages the site exposes
3. Create `app/robots.ts` and point it at the sitemap.
4. Create `app/llms.txt/route.ts` and return plain text with cache headers from a shared helper.
5. Add route-specific OG images under `public/og/` when the project needs custom share art.

## 8. Add Contributor Documentation

1. Add the editorial rules to `AGENTS.md` and/or `README.md`:
   - `seoTitle`: 50-70 characters
   - metadata descriptions: 110-170 characters
   - visible page titles may be longer
2. Document the file layout and build flow:
   - content source directory
   - metadata helpers
   - sitemap, robots, RSS, and `llms.txt`
   - CSP/security header location
3. Keep that documentation updated whenever the blog/SEO architecture changes.

## 9. Match the Testing Pattern

1. Add metadata helper tests.
2. Add content schema tests.
3. Add content SEO helper tests.
4. Add `llms.txt` helper tests if you introduce a facts generator.
5. Add sitemap coverage tests for dynamic content.

## 10. Verify End to End

From the target app root, run the equivalent of:

```bash
npm run content:build
npm run typecheck
npm test
npm run build
```

If the project uses `pnpm`, `yarn`, or `bun`, adapt the commands but keep the same order.

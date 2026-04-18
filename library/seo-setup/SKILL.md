---
name: seo-setup
description: >-
  Set up a reusable blog, SEO, and discovery foundation for a Next.js App
  Router project: site constants, reusable metadata helpers, MDX content
  collections, Zod frontmatter validation, blog index/detail routes, article
  JSON-LD, CSP and security headers in `next.config.ts`, `llms.txt`, RSS,
  sitemap, robots, and Open Graph image resolution. Use when creating or
  refactoring a content-driven site or blog that needs consistent metadata,
  crawlable outputs, and contributor rules documented in `AGENTS.md` and/or
  `README.md`.
---

# Setup Blog SEO Foundation

Set up a reusable Next.js content system with clean separation between site constants, content logic, metadata generation, and discovery/security outputs.

## Core Pattern

- Keep site-wide URLs, brand text, and OG path helpers in `lib/site.ts`.
- Keep generic metadata generation in `lib/metadata.ts`.
- Keep content schema, query helpers, and content SEO helpers under `lib/content/`.
- Keep authored MDX in `content/` and compile it through `content-collections.ts`.
- Keep CSP and the shared security header set in `next.config.ts`, applied to `/:path*`.
- Keep content pages inside an `app/(content)/` route group or equivalent shared content shell.
- Use Next.js metadata routes for `app/sitemap.ts` and `app/robots.ts`, plus `app/feed.xml/route.ts` for RSS.
- Keep `llms.txt` content in a source-of-truth helper and expose it through `app/llms.txt/route.ts`.
- Resolve Open Graph images from the route or canonical URL, with a fallback image if a route-specific asset is missing.

## Workflow

1. Read [references/implementation-checklist.md](references/implementation-checklist.md) first for the ordered setup.
2. Read [references/source-map.md](references/source-map.md) when you need the recommended file layout and responsibility split.
3. Read [references/content-contract.md](references/content-contract.md) when creating MDX collections, frontmatter, or editorial rules.
4. Read [references/security-and-discovery.md](references/security-and-discovery.md) when wiring CSP, security headers, `llms.txt`, `robots.ts`, or `sitemap.ts`.
5. Customize all project constants, route groups, supported embeds, discovery sections, and CTA variants for the target project.
6. Keep one source of truth for site URLs and canonical generation. Do not hardcode the site origin across many files.
7. Keep filtering, sorting, taxonomy, and related-content logic in query helpers instead of page components.
8. Add or update tests around metadata helpers, schema validation, `llms.txt`, and sitemap coverage whenever you change the structure.

## Non-Negotiables

- Use absolute canonical URLs in content frontmatter.
- Generate metadata through helpers instead of duplicating ad hoc metadata objects across content pages.
- Emit JSON-LD from shared helpers so article pages stay thin.
- Build content collections before typecheck, tests, or production builds.
- Keep MDX component registration centralized; do not import components directly inside MDX files.
- Keep SEO-facing titles in a dedicated `seoTitle` field and enforce a 50-70 character target there.
- Keep SEO descriptions in the 110-170 character range.
- For non-content pages, keep the metadata title between 50 and 70 characters and the metadata description between 110 and 170 characters, even if the visible page heading is longer.
- Keep the security header implementation centralized in `next.config.ts`; do not scatter CSP or header mutations across routes unless the user explicitly wants route-specific overrides.
- Keep `llms.txt`, `robots.ts`, and `sitemap.ts` driven from shared helpers and site constants rather than hardcoding disconnected values.
- Add these editorial rules and the full blog/SEO setup details to the target repository's `AGENTS.md` and/or `README.md` so future contributors keep following the same contract.

## Verification

From the target app root, run the equivalent of:

```bash
npm run content:build
npm run typecheck
npm test
npm run build
```

If the project uses `pnpm`, `yarn`, or `bun`, adapt the commands but keep the same order.

## References

- [references/implementation-checklist.md](references/implementation-checklist.md): ordered setup steps and verification sequence
- [references/source-map.md](references/source-map.md): recommended file-by-file architecture map
- [references/content-contract.md](references/content-contract.md): frontmatter schema, editorial rules, and authoring constraints
- [references/security-and-discovery.md](references/security-and-discovery.md): CSP, headers, `llms.txt`, `robots.ts`, and `sitemap.ts` patterns

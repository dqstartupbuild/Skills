# Security and Discovery

Use this file when setting up the non-content infrastructure around the blog and SEO layer.

## `next.config.ts` Pattern

Keep the site's CSP and shared headers in `next.config.ts`, not in middleware or route handlers, unless the project explicitly needs route-specific overrides.

### Recommended Structure

```ts
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "frame-src 'self' https://www.youtube-nocookie.com",
  "connect-src 'self' https: ws: wss:",
  "worker-src 'self' blob:",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
];
```

### Application Pattern

```ts
async headers() {
  return [
    {
      source: "/:path*",
      headers: securityHeaders,
    },
  ];
}
```

### Notes

- Start with a small header set and add hosts only when the project actually needs them.
- If the project supports external embeds, add only the approved hosts to `frame-src`.
- If the project can avoid `unsafe-inline` or `unsafe-eval`, tighten the policy.
- If analytics, APIs, or websockets require extra hosts, add them explicitly to `script-src` or `connect-src`.

## `llms.txt` Pattern

Do not hardcode the full text inside the route. Keep a helper such as `lib/llms.ts` or `lib/llms-text.ts` as the source of truth and expose it through `app/llms.txt/route.ts`.

### Suggested Helper Shape

- `facts` or `entries`
- `formatFactValue(...)`
- `createLlmsTxt()`

This lets the project reuse the same facts block or machine-readable sections in both UI and `llms.txt`.

### Route Pattern

```ts
export function GET() {
  const text = createLlmsTxt();

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
```

### Suggested Content Shape

Include only sections that are true and useful for the target project, for example:

- `Domain`
- `Owner`
- `LLM-Policy`
- short project summary
- `## Facts Block`
- `## Core Reading Path`
- `## Key Sections`
- `## Product or Site Context`

## `robots.ts` Pattern

Use a Next.js metadata route:

```ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/preview/",
          "/_next/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
```

### Notes

- `siteUrl` should come from `lib/site.ts`.
- Block private, preview, generated, or non-canonical surfaces only if they should not be crawled.
- Keep the `disallow` list aligned with real project behavior.

## `sitemap.ts` Pattern

Mix static pages and dynamically generated content in one centralized sitemap.

### Common Static Entries

- `/`
- `/blog`
- `/pricing`
- `/features`
- `/about`
- `/terms`
- `/privacy`
- `/support`

### Common Dynamic Entries

- every published blog post
- every published comparison or alternative page
- every live free tool, calculator, or programmatic landing page

### Priority/Frequency Guidance

- home: around `1.0`
- hub pages: around `0.84-0.9`
- articles and comparisons: around `0.75-0.82`
- legal/support pages: around `0.5-0.65`

Adjust values to match the target project's real page importance.

## Tests to Mirror

- `lib/llms.test.ts`: verify the facts block and required `llms.txt` sections.
- `app/sitemap.test.ts`: verify that all dynamic surfaces are represented.

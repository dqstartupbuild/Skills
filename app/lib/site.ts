const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  "http://localhost:3000";

function normalizePathname(pathname = "/") {
  if (!pathname) {
    return "/";
  }

  let normalized = pathname.trim();

  try {
    if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
      normalized = new URL(normalized).pathname;
    }
  } catch {
    normalized = pathname;
  }

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  if (normalized.length > 1 && normalized.endsWith("/")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized || "/";
}

export const site = {
  name: "DQ Skills Library",
  url: configuredSiteUrl.replace(/\/$/, ""),
  publisherName: "@dqstartupbuild",
  defaultTitle: "DQ Skills Library — Agentic Infrastructure for AI Coding Agents",
  defaultDescription:
    "A curated collection of production-grade skills for AI coding agents. Codified architectural patterns that turn AI assistants into precision engineering tools.",
  keywords: [
    "AI skills",
    "agent skills",
    "Claude Code",
    "Cursor",
    "Windsurf",
    "AI coding assistant",
    "agentic infrastructure",
    "developer tools",
  ] as string[],
  ctaUrl: "https://github.com/dqstartupbuild/skills",
  ctaLabel: "View on GitHub",
  skillInstallBase: "dqstartupbuild/skills/library",
  twitterHandle: "@dqstartupbuild",
  staticPages: [
    {
      pathname: "/",
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      pathname: "/blog",
      changeFrequency: "weekly" as const,
      priority: 0.88,
    },
    {
      pathname: "/privacy",
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      pathname: "/terms",
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ],
};

export function createCanonicalUrl(pathname = "/") {
  return new URL(normalizePathname(pathname), `${site.url}/`).toString();
}

export function createOgAssetPath(pathname = "/") {
  const normalized = normalizePathname(pathname);
  return normalized === "/" ? "/og/default.png" : `/og${normalized}.png`;
}

export function createOgImageUrl(pathname = "/") {
  return createCanonicalUrl(createOgAssetPath(pathname));
}

export function createWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.defaultDescription,
  };
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.publisherName,
    url: site.url,
    description: site.defaultDescription,
  };
}

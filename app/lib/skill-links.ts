import { site } from "@/lib/site";

export function createSkillRoutePath(slug: string | string[]) {
  const normalizedSlug = normalizeSkillSlug(slug);
  return normalizedSlug ? `/skills/${normalizedSlug}` : "/skills";
}

export function createSkillGitHubUrl(
  slug: string | string[],
  filePath?: string,
) {
  const normalizedSlug = normalizeSkillSlug(slug);

  if (!normalizedSlug) {
    return site.ctaUrl;
  }

  const normalizedFilePath = normalizeRelativePath(filePath);
  const routeType = normalizedFilePath ? "blob" : "tree";
  const suffix = normalizedFilePath ? `/${normalizedFilePath}` : "";

  return `${site.ctaUrl}/${routeType}/main/library/${normalizedSlug}${suffix}`;
}

export function normalizeSkillSlug(slug: string | string[]) {
  const rawSegments = Array.isArray(slug) ? slug : slug.split("/");
  const normalizedSegments = rawSegments
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (
    normalizedSegments.length === 0 ||
    normalizedSegments.some((segment) => segment === "." || segment === "..")
  ) {
    return null;
  }

  return normalizePath(normalizedSegments.join("/"));
}

function normalizeRelativePath(filePath?: string) {
  if (!filePath) {
    return null;
  }

  const normalizedFilePath = normalizePath(filePath).replace(/^\/+/, "");
  const segments = normalizedFilePath.split("/").filter(Boolean);

  if (
    segments.length === 0 ||
    segments.some((segment) => segment === "." || segment === "..")
  ) {
    return null;
  }

  return segments.join("/");
}

function normalizePath(value: string) {
  return value.replaceAll("\\", "/");
}

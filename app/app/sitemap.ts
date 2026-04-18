import type { MetadataRoute } from "next";
import { getPublishedBlogPosts } from "@/lib/content/queries";
import { createCanonicalUrl, site } from "@/lib/site";
import { getAllSkillSlugs } from "@/lib/skill-detail";
import { createSkillRoutePath } from "@/lib/skill-links";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = site.staticPages.map((page) => ({
    url: createCanonicalUrl(page.pathname),
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const postEntries = getPublishedBlogPosts().map((post) => ({
    url: post.canonical,
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: "monthly" as const,
    priority: 0.78,
  }));

  const skillSlugs = await getAllSkillSlugs();
  const skillEntries = skillSlugs.map((slug) => ({
    url: createCanonicalUrl(createSkillRoutePath(slug)),
    lastModified: new Date(), // using current date since skills are dynamically sourced
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...postEntries, ...skillEntries];
}

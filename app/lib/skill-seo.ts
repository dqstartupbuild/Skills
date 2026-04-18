import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { createSkillRoutePath } from "@/lib/skill-links";
import { createCanonicalUrl, site } from "@/lib/site";
import type { SkillDetail } from "@/lib/skill-detail";

export function createSkillMetadata(skill: SkillDetail): Metadata {
  return createPageMetadata({
    canonical: createSkillRoutePath(skill.slug),
    description: skill.description,
    keywords: [...site.keywords, skill.name, ...skill.tags],
    title: `${skill.name} Skill`,
  });
}

export function createSkillJsonLd(skill: SkillDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: skill.name,
    description: skill.description,
    programmingLanguage: skill.tags,
    codeRepository: skill.githubUrl,
    author: {
      "@type": "Organization",
      name: site.publisherName,
      url: site.url,
    },
    mainEntityOfPage: createCanonicalUrl(createSkillRoutePath(skill.slug)),
  };
}

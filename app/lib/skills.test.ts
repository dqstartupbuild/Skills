import { describe, expect, it } from "vitest";
import { getSkillCatalog } from "@/lib/skills";

describe("getSkillCatalog", () => {
  it("builds the landing page catalog from the library directory", async () => {
    const skills = await getSkillCatalog();

    expect(skills.map((skill) => skill.slug)).toEqual(
      expect.arrayContaining(["og-studio", "seo-setup"]),
    );

    const ogStudio = skills.find((skill) => skill.slug === "og-studio");

    expect(ogStudio).toMatchObject({
      installTarget: "dqstartupbuild/skills/library/og-studio",
      name: "Open Graph Images",
      status: "stable",
    });
    expect(ogStudio?.features.length).toBeGreaterThan(0);

    const seoSetup = skills.find((skill) => skill.slug === "seo-setup");

    expect(seoSetup?.description).toContain("Next.js App Router project");
  });
});

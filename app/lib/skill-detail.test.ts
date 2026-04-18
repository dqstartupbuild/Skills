import { describe, expect, it } from "vitest";
import { getSkillDetailBySlug } from "@/lib/skill-detail";
import { createSkillGitHubUrl } from "@/lib/skill-links";

describe("skill-detail", () => {
  it("creates folder and file GitHub links for skills", () => {
    expect(createSkillGitHubUrl("og-studio")).toBe(
      "https://github.com/dqstartupbuild/skills/tree/main/library/og-studio",
    );
    expect(createSkillGitHubUrl("og-studio", "scripts/detect_og_targets.py")).toBe(
      "https://github.com/dqstartupbuild/skills/blob/main/library/og-studio/scripts/detect_og_targets.py",
    );
  });

  it("returns detail data with a tree and default source preview", async () => {
    const detail = await getSkillDetailBySlug("og-studio");

    expect(detail).not.toBeNull();
    expect(detail?.defaultFilePath).toBe("SKILL.md");
    expect(detail?.selectedFile?.path).toBe("SKILL.md");
    expect(detail?.tree.some((node) => node.path === "README.md")).toBe(true);
    expect(detail?.tree.some((node) => node.path === "scripts")).toBe(true);
    expect(detail?.overviewSource).toContain("#");
  });

  it("allows selecting a nested file from the tree", async () => {
    const detail = await getSkillDetailBySlug(
      "og-studio",
      "scripts/detect_og_targets.py",
    );

    expect(detail?.selectedFile?.path).toBe("scripts/detect_og_targets.py");
    expect(detail?.selectedFile?.language).toBe("python");
  });

  it("rejects invalid skill slugs", async () => {
    await expect(getSkillDetailBySlug("../secrets")).resolves.toBeNull();
  });
});

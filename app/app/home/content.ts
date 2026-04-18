export const HOME_STEPS = [
  {
    number: "01",
    title: "Pick a Skill",
    description:
      "Browse the catalog and find the architectural pattern your project needs. Each skill is a self-contained instruction set.",
  },
  {
    number: "02",
    title: "Point Your Agent",
    description:
      "Add the skill to your local environment with a single command. Works with Claude Code, Cursor, Windsurf, and any agent that reads SKILL.md files.",
  },
  {
    number: "03",
    title: "Ship with Precision",
    description:
      "Your agent now executes multi-step engineering tasks using battle-tested patterns. No hallucination. No improvisation. Just production-grade output.",
  },
] as const;

export const HOME_AGENTS = [
  "Codex",
  "Claude Code",
  "Cursor",
  "Windsurf",
  "Gemini CLI",
  "+ More",
] as const;

export const SOCIAL_LINKS = {
  x: "https://x.com/dqstartupbuild",
} as const;

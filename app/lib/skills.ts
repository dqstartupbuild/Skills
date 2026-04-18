import { promises as fs } from "node:fs";
import path from "node:path";
import { site } from "@/lib/site";

export type SkillStatus = "stable" | "beta" | "coming-soon";

export type SkillCatalogEntry = {
  slug: string;
  name: string;
  description: string;
  status: SkillStatus;
  tags: string[];
  features: string[];
  installTarget: string;
};

type FrontmatterValue = boolean | string | string[];

type ParsedFrontmatter = {
  description?: string;
  draft?: boolean;
  hidden?: boolean;
  name?: string;
  status?: string;
  tags?: string[];
};

const LIBRARY_ROOT = path.resolve(process.cwd(), "..", "library");

const PREFERRED_FEATURE_HEADINGS = [
  /^key features?$/i,
  /^features?$/i,
  /^included$/i,
  /^core pattern$/i,
  /^core principles?$/i,
  /^architectural principles?$/i,
  /^workflow$/i,
  /^overview$/i,
];

const ACRONYMS = new Map([
  ["ai", "AI"],
  ["api", "API"],
  ["llm", "LLM"],
  ["mdx", "MDX"],
  ["og", "OG"],
  ["seo", "SEO"],
  ["ui", "UI"],
  ["ux", "UX"],
]);

export async function getSkillCatalog(): Promise<SkillCatalogEntry[]> {
  const skillFiles = await collectSkillFiles(LIBRARY_ROOT);
  const skills = await Promise.all(skillFiles.map(readSkillCatalogEntry));

  return skills
    .filter((skill): skill is SkillCatalogEntry => Boolean(skill))
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function collectSkillFiles(directory: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    const nestedSkillFiles = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => collectSkillFiles(path.join(directory, entry.name))),
    );

    const directSkillFiles = entries
      .filter((entry) => entry.isFile() && entry.name === "SKILL.md")
      .map((entry) => path.join(directory, entry.name));

    return [...directSkillFiles, ...nestedSkillFiles.flat()];
  } catch {
    return [];
  }
}

async function readSkillCatalogEntry(
  skillFilePath: string,
): Promise<SkillCatalogEntry | null> {
  const skillDirectory = path.dirname(skillFilePath);
  const relativeDirectory = normalizePath(
    path.relative(LIBRARY_ROOT, skillDirectory),
  );

  const skillSource = await fs.readFile(skillFilePath, "utf8");
  const readmeSource = await readOptionalFile(path.join(skillDirectory, "README.md"));
  const { body, data } = parseFrontmatter(skillSource);

  if (data.hidden || data.draft) {
    return null;
  }

  const name =
    extractHeading(body) ??
    humanizeSkillName(data.name ?? relativeDirectory);

  const description =
    data.description ??
    extractFirstParagraph(readmeSource ?? body) ??
    `Install ${relativeDirectory} to add this skill to your agents.`;

  const features = extractFeatures(readmeSource, body, description);

  return {
    slug: relativeDirectory,
    name,
    description,
    status: normalizeStatus(data.status),
    tags: normalizeTags(data.tags),
    features,
    installTarget: `${site.skillInstallBase}/${relativeDirectory}`,
  };
}

async function readOptionalFile(filePath: string) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

function parseFrontmatter(source: string) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    return { body: source, data: {} as ParsedFrontmatter };
  }

  return {
    body: source.slice(match[0].length),
    data: parseYamlLikeFrontmatter(match[1]),
  };
}

function parseYamlLikeFrontmatter(frontmatter: string): ParsedFrontmatter {
  const lines = frontmatter.split(/\r?\n/);
  const values: Record<string, FrontmatterValue> = {};

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.trim()) {
      continue;
    }

    const keyValueMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);

    if (!keyValueMatch) {
      continue;
    }

    const [, key, rawValue] = keyValueMatch;
    const value = rawValue.trim();

    if (/^(>|>-|\||\|-)$/.test(value)) {
      const blockLines: string[] = [];
      let cursor = index + 1;

      while (cursor < lines.length) {
        const nextLine = lines[cursor];

        if (!nextLine.trim()) {
          blockLines.push("");
          cursor += 1;
          continue;
        }

        if (!/^\s+/.test(nextLine)) {
          break;
        }

        blockLines.push(nextLine.replace(/^\s{2}/, ""));
        cursor += 1;
      }

      index = cursor - 1;
      values[key] = value.startsWith(">")
        ? foldBlockValue(blockLines)
        : blockLines.join("\n").trim();
      continue;
    }

    if (value === "") {
      const arrayValues: string[] = [];
      let cursor = index + 1;

      while (cursor < lines.length && /^\s*-\s+/.test(lines[cursor])) {
        arrayValues.push(
          stripQuotes(lines[cursor].replace(/^\s*-\s+/, "").trim()),
        );
        cursor += 1;
      }

      if (arrayValues.length > 0) {
        values[key] = arrayValues;
        index = cursor - 1;
      } else {
        values[key] = "";
      }

      continue;
    }

    if (/^\[(.*)\]$/.test(value)) {
      values[key] = value
        .slice(1, -1)
        .split(",")
        .map((entry) => stripQuotes(entry.trim()))
        .filter(Boolean);
      continue;
    }

    values[key] = parseScalar(value);
  }

  return {
    description: asString(values.description),
    draft: asBoolean(values.draft),
    hidden: asBoolean(values.hidden),
    name: asString(values.name),
    status: asString(values.status),
    tags: asStringArray(values.tags),
  };
}

function foldBlockValue(lines: string[]) {
  return lines
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .trim();
}

function parseScalar(value: string): FrontmatterValue {
  const normalized = stripQuotes(value);

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return normalized;
}

function extractHeading(markdown: string) {
  const headingMatch = markdown.match(/^#\s+(.+)$/m);
  return headingMatch ? toPlainText(headingMatch[1]) : null;
}

function extractFirstParagraph(markdown: string) {
  const lines = markdown.split(/\r?\n/);
  const paragraph: string[] = [];
  let inCodeFence = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      inCodeFence = !inCodeFence;
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    if (!trimmed) {
      if (paragraph.length > 0) {
        break;
      }

      continue;
    }

    if (
      /^#/.test(trimmed) ||
      /^\s*[-*]\s/.test(trimmed) ||
      /^\s*\d+\.\s/.test(trimmed) ||
      /^>/.test(trimmed)
    ) {
      if (paragraph.length > 0) {
        break;
      }

      continue;
    }

    paragraph.push(trimmed);
  }

  return paragraph.length > 0 ? toPlainText(paragraph.join(" ")) : null;
}

function extractFeatures(
  readmeSource: string | null,
  skillBody: string,
  description: string,
) {
  for (const source of [readmeSource, skillBody]) {
    if (!source) {
      continue;
    }

    const preferredBullets = extractBulletsFromPreferredSections(source);

    if (preferredBullets.length > 0) {
      return preferredBullets.slice(0, 4);
    }
  }

  for (const source of [readmeSource, skillBody]) {
    if (!source) {
      continue;
    }

    const bullets = extractBullets(source);

    if (bullets.length > 0) {
      return bullets.slice(0, 4);
    }
  }

  return description
    .split(/(?<=[.?!])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .slice(0, 3);
}

function extractBulletsFromPreferredSections(markdown: string) {
  const sections = splitMarkdownSections(markdown);

  for (const headingPattern of PREFERRED_FEATURE_HEADINGS) {
    for (const section of sections) {
      if (!section.heading || !headingPattern.test(section.heading)) {
        continue;
      }

      const bullets = extractBullets(section.lines.join("\n"));

      if (bullets.length > 0) {
        return bullets;
      }
    }
  }

  return [];
}

function splitMarkdownSections(markdown: string) {
  const sections: Array<{ heading: string | null; lines: string[] }> = [];
  let currentSection: { heading: string | null; lines: string[] } = {
    heading: null,
    lines: [],
  };

  for (const line of markdown.split(/\r?\n/)) {
    const headingMatch = line.match(/^#{2,6}\s+(.+)$/);

    if (headingMatch) {
      sections.push(currentSection);
      currentSection = {
        heading: toPlainText(headingMatch[1]),
        lines: [],
      };
      continue;
    }

    currentSection.lines.push(line);
  }

  sections.push(currentSection);

  return sections;
}

function extractBullets(markdown: string) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => /^\s*-\s+/.test(line))
    .map((line) => toPlainText(line.replace(/^\s*-\s+/, "")))
    .filter(Boolean);
}

function normalizeStatus(status: string | undefined): SkillStatus {
  switch ((status ?? "").toLowerCase()) {
    case "alpha":
    case "beta":
    case "experimental":
    case "preview":
      return "beta";
    case "coming-soon":
    case "planned":
    case "soon":
      return "coming-soon";
    default:
      return "stable";
  }
}

function normalizeTags(tags: string[] | undefined) {
  return (tags ?? [])
    .map((tag) => toPlainText(tag))
    .filter(Boolean)
    .slice(0, 6);
}

function humanizeSkillName(value: string) {
  const skillName = value.split("/").pop() ?? value;

  return skillName
    .split(/[-_]/)
    .filter(Boolean)
    .map((segment) => {
      const lowerSegment = segment.toLowerCase();
      return ACRONYMS.get(lowerSegment) ?? capitalize(lowerSegment);
    })
    .join(" ");
}

function parseBoolean(value: FrontmatterValue | undefined) {
  return typeof value === "boolean" ? value : undefined;
}

function asBoolean(value: FrontmatterValue | undefined) {
  return parseBoolean(value) ?? false;
}

function asString(value: FrontmatterValue | undefined) {
  return typeof value === "string" ? value : undefined;
}

function asStringArray(value: FrontmatterValue | undefined) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : undefined;
}

function stripQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function normalizePath(value: string) {
  return value.split(path.sep).join("/");
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toPlainText(value: string) {
  return value
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

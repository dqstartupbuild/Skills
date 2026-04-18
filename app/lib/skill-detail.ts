import { promises as fs } from "node:fs";
import path from "node:path";
import {
  createSkillGitHubUrl,
  normalizeSkillSlug,
} from "@/lib/skill-links";
import { getSkillCatalog, type SkillCatalogEntry } from "@/lib/skills";

export type SkillFileTreeNode = {
  children?: SkillFileTreeNode[];
  name: string;
  path: string;
  type: "directory" | "file";
};

export type SkillSourceFile = {
  content: string | null;
  isBinary: boolean;
  language: string;
  name: string;
  path: string;
};

export type SkillDetail = SkillCatalogEntry & {
  defaultFilePath: string | null;
  fileCount: number;
  githubUrl: string;
  overviewSource: string;
  readmeSource: string | null;
  selectedFile: SkillSourceFile | null;
  tree: SkillFileTreeNode[];
};

const LIBRARY_ROOT = path.resolve(process.cwd(), "..", "library");

const DEFAULT_SOURCE_FILE_CANDIDATES = ["SKILL.md", "README.md"];
const IGNORED_FILE_NAMES = new Set([".DS_Store"]);

export async function getAllSkillSlugs() {
  return (await getSkillCatalog()).map((skill) => skill.slug);
}

export async function getSkillDetailBySlug(
  slug: string | string[],
  selectedFilePath?: string,
): Promise<SkillDetail | null> {
  const normalizedSlug = normalizeSkillSlug(slug);

  if (!normalizedSlug) {
    return null;
  }

  const [catalog, skillDirectory] = await Promise.all([
    getSkillCatalog(),
    resolveSkillDirectory(normalizedSlug),
  ]);

  if (!skillDirectory) {
    return null;
  }

  const skill = catalog.find((entry) => entry.slug === normalizedSlug);

  if (!skill) {
    return null;
  }

  const { filePaths, tree } = await buildSkillTree(skillDirectory);
  const readmePath = path.join(skillDirectory, "README.md");
  const skillPath = path.join(skillDirectory, "SKILL.md");
  const readmeSource = await readOptionalTextFile(readmePath);
  const skillSource = await readOptionalTextFile(skillPath);
  const overviewSource =
    readmeSource ??
    (skillSource ? stripFrontmatter(skillSource) : null) ??
    `# ${skill.name}\n\n${skill.description}`;

  const defaultFilePath = selectFilePath(filePaths);
  const safeSelectedFilePath = selectFilePath(filePaths, selectedFilePath);
  const selectedFile = safeSelectedFilePath
    ? await readSkillSourceFile(skillDirectory, safeSelectedFilePath)
    : null;

  return {
    ...skill,
    defaultFilePath,
    fileCount: filePaths.length,
    githubUrl: createSkillGitHubUrl(normalizedSlug),
    overviewSource,
    readmeSource,
    selectedFile,
    tree,
  };
}

async function resolveSkillDirectory(slug: string) {
  const skillDirectory = path.resolve(LIBRARY_ROOT, slug);

  if (!isWithinDirectory(LIBRARY_ROOT, skillDirectory)) {
    return null;
  }

  try {
    const stats = await fs.stat(skillDirectory);
    return stats.isDirectory() ? skillDirectory : null;
  } catch {
    return null;
  }
}

async function buildSkillTree(
  directory: string,
  currentRelativePath = "",
): Promise<{ filePaths: string[]; tree: SkillFileTreeNode[] }> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const visibleEntries = entries
    .filter((entry) => !IGNORED_FILE_NAMES.has(entry.name))
    .sort(sortDirectoryEntries);

  const filePaths: string[] = [];
  const tree = await Promise.all(
    visibleEntries.map(async (entry) => {
      const entryRelativePath = normalizePath(
        path.join(currentRelativePath, entry.name),
      );
      const entryAbsolutePath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        const nestedTree = await buildSkillTree(
          entryAbsolutePath,
          entryRelativePath,
        );

        filePaths.push(...nestedTree.filePaths);

        return {
          children: nestedTree.tree,
          name: entry.name,
          path: entryRelativePath,
          type: "directory" as const,
        };
      }

      filePaths.push(entryRelativePath);

      return {
        name: entry.name,
        path: entryRelativePath,
        type: "file" as const,
      };
    }),
  );

  return { filePaths, tree };
}

async function readSkillSourceFile(
  skillDirectory: string,
  relativePath: string,
): Promise<SkillSourceFile | null> {
  const absolutePath = path.resolve(skillDirectory, relativePath);

  if (!isWithinDirectory(skillDirectory, absolutePath)) {
    return null;
  }

  try {
    const contents = await fs.readFile(absolutePath);
    const isBinary = contents.includes(0);

    return {
      content: isBinary ? null : contents.toString("utf8"),
      isBinary,
      language: inferLanguage(relativePath),
      name: path.basename(relativePath),
      path: normalizePath(relativePath),
    };
  } catch {
    return null;
  }
}

async function readOptionalTextFile(filePath: string) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

function selectFilePath(filePaths: string[], requestedPath?: string) {
  const normalizedRequestedPath = normalizeRelativePath(requestedPath);

  if (normalizedRequestedPath && filePaths.includes(normalizedRequestedPath)) {
    return normalizedRequestedPath;
  }

  for (const candidate of DEFAULT_SOURCE_FILE_CANDIDATES) {
    if (filePaths.includes(candidate)) {
      return candidate;
    }
  }

  return filePaths[0] ?? null;
}

function sortDirectoryEntries(
  left: { isDirectory(): boolean; name: string },
  right: { isDirectory(): boolean; name: string },
) {
  if (left.isDirectory() !== right.isDirectory()) {
    return left.isDirectory() ? -1 : 1;
  }

  return left.name.localeCompare(right.name);
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

function isWithinDirectory(root: string, target: string) {
  const relativePath = path.relative(root, target);
  return (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath))
  );
}

function inferLanguage(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".js":
    case ".mjs":
    case ".cjs":
      return "javascript";
    case ".jsx":
      return "jsx";
    case ".ts":
      return "typescript";
    case ".tsx":
      return "tsx";
    case ".py":
      return "python";
    case ".rb":
      return "ruby";
    case ".rs":
      return "rust";
    case ".sh":
      return "shell";
    case ".json":
      return "json";
    case ".yml":
    case ".yaml":
      return "yaml";
    case ".md":
    case ".mdx":
      return "markdown";
    default:
      return extension ? extension.slice(1) : "text";
  }
}

function normalizePath(value: string) {
  return value.split(path.sep).join("/");
}

function stripFrontmatter(source: string) {
  return source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

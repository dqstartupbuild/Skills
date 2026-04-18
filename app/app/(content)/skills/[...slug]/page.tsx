import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { SkillFilePreview } from "@/app/skill-detail/components/file-preview";
import { SkillFileTree } from "@/app/skill-detail/components/file-tree";
import { GitHubIcon } from "@/app/home/components/icons";
import { mdxComponents } from "@/lib/content/mdx-components";
import {
  getAllSkillSlugs,
  getSkillDetailBySlug,
} from "@/lib/skill-detail";
import {
  createSkillGitHubUrl,
  createSkillRoutePath,
} from "@/lib/skill-links";
import { createSkillMetadata, createSkillJsonLd } from "@/lib/skill-seo";
import { compileSkillMarkdown } from "@/lib/skill-mdx";
import { site } from "@/lib/site";

type SkillDetailPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ path?: string | string[] }>;
};

export async function generateStaticParams() {
  return (await getAllSkillSlugs()).map((slug) => ({
    slug: slug.split("/"),
  }));
}

export async function generateMetadata({ params }: SkillDetailPageProps) {
  const { slug } = await params;
  const skill = await getSkillDetailBySlug(slug);

  if (!skill) {
    return {};
  }

  return createSkillMetadata(skill);
}

export default async function SkillDetailPage({
  params,
  searchParams,
}: SkillDetailPageProps) {
  const [{ path: selectedPath }, { slug }] = await Promise.all([
    searchParams,
    params,
  ]);
  const normalizedSelectedPath = Array.isArray(selectedPath)
    ? selectedPath[0]
    : selectedPath;
  const skill = await getSkillDetailBySlug(slug, normalizedSelectedPath);

  if (!skill) {
    notFound();
  }

  const skillPath = createSkillRoutePath(skill.slug);
  const readmeCode = await compileSkillMarkdown(
    skill.slug,
    skill.overviewSource,
    skill.readmeSource ? "README.md" : "SKILL.md",
  );

  const structuredData = [createSkillJsonLd(skill)];

  return (
    <div className="px-6 py-16 md:py-20">
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <div className="mx-auto max-w-7xl">
        <Link href="/#skills" className="text-sm text-text-tertiary hover:text-accent">
          ← Back to the skills catalog
        </Link>

        <header className="mt-8 flex flex-col gap-8 rounded-[2rem] border border-border bg-surface px-8 py-8 shadow-2xl shadow-black/15 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Skill Detail
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
                {skill.name}
              </h1>
              <span className={`status-badge ${skill.status}`}>{skill.status}</span>
            </div>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
              {skill.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {skill.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
              <span className="tag">{skill.fileCount} files</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <a
              href={skill.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <GitHubIcon className="h-4 w-4" />
              View on GitHub
            </a>
            <div
              className="rounded-2xl border border-border bg-surface-elevated px-4 py-3"
              style={{ minWidth: "18rem" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-tertiary">
                Install
              </p>
              <code className="mt-2 block break-all mono text-sm text-text-secondary">
                npx skills add{" "}
                <span style={{ color: "var(--success)" }}>{skill.installTarget}</span>
              </code>
            </div>
          </div>
        </header>

        <div className="mt-10 grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-border bg-surface p-5 shadow-2xl shadow-black/10 xl:sticky xl:top-24">
            <div className="border-b border-border pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Repository Tree
              </p>
              <p className="mt-2 text-sm text-text-secondary">
                Browse the files bundled with this skill and switch the source
                preview from the tree below.
              </p>
            </div>

            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-1">
              <SkillFileTree
                nodes={skill.tree}
                selectedPath={normalizedSelectedPath ?? null}
                skillPath={skillPath}
              />
            </div>
          </aside>

          <div className="space-y-8">
            <section className="rounded-3xl border border-border bg-surface p-8 shadow-2xl shadow-black/10">
              <div className="flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    README Preview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-text-primary">
                    Overview
                  </h2>
                </div>
                {skill.readmeSource ? (
                  <a
                    href={createSkillGitHubUrl(skill.slug, "README.md")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <GitHubIcon className="h-4 w-4" />
                    Open README
                  </a>
                ) : null}
              </div>

              <article className="mt-8 space-y-6">
                <MDXContent code={readmeCode} components={mdxComponents} />
              </article>
            </section>

            {normalizedSelectedPath && skill.selectedFile ? (
              <SkillFilePreview
                file={skill.selectedFile}
                githubUrl={createSkillGitHubUrl(skill.slug, skill.selectedFile.path)}
                skillPath={skillPath}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

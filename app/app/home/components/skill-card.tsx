import Link from "next/link";
import { CopyButton } from "@/app/home/components/copy-button";
import { CheckIcon } from "@/app/home/components/icons";
import type { RevealRefCallback } from "@/app/home/types";
import { createSkillRoutePath } from "@/lib/skill-links";
import type { SkillCatalogEntry, SkillStatus } from "@/lib/skills";

type SkillCardProps = {
  addRevealRef: RevealRefCallback;
  skill: SkillCatalogEntry;
  transitionDelay: string;
};

export function SkillCard({
  addRevealRef,
  skill,
  transitionDelay,
}: SkillCardProps) {
  const copyCommand = `npx skills add ${skill.installTarget}`;
  const skillPath = createSkillRoutePath(skill.slug);

  return (
    <div
      ref={addRevealRef}
      className="reveal skill-card group"
      style={{ transitionDelay }}
    >
      <Link
        href={skillPath}
        aria-label={`View ${skill.name} skill`}
        className="absolute inset-0 z-10 rounded-[inherit]"
      />
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xl font-bold text-text-primary">{skill.name}</h3>
            <span className={`status-badge ${skill.status}`}>
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: getStatusColor(skill.status) }}
              />
              {skill.status}
            </span>
          </div>

          <p className="text-text-secondary text-sm leading-relaxed mb-4">
            {skill.description}
          </p>

          <p className="mb-4 text-sm font-medium text-accent-light">
            Open skill detail →
          </p>

          {skill.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-5">
              {skill.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-lg mono text-sm group relative"
            style={{
              background: "rgba(6, 8, 15, 0.6)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-center gap-3 pr-8">
              <span className="text-text-tertiary">$</span>
              <code className="text-text-secondary">
                npx skills add{" "}
                <span style={{ color: "var(--success)" }}>
                  {skill.installTarget}
                </span>
              </code>
            </div>
            <div className="absolute right-3 z-20 opacity-50 group-hover:opacity-100 transition-opacity">
              <CopyButton textToCopy={copyCommand} />
            </div>
          </div>
        </div>

        <div
          className="lg:w-72 p-4 rounded-xl"
          style={{
            background: "rgba(6, 8, 15, 0.4)",
            border: "1px solid var(--border)",
          }}
        >
          <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
            Included
          </p>
          <ul className="space-y-2.5">
            {skill.features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-sm text-text-secondary"
              >
                <CheckIcon
                  className="w-4 h-4 mt-0.5 shrink-0"
                  stroke="var(--success)"
                />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: SkillStatus) {
  if (status === "stable") {
    return "var(--success)";
  }

  if (status === "beta") {
    return "var(--warning)";
  }

  return "var(--accent-secondary)";
}

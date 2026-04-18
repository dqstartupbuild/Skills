import { SkillCard } from "@/app/home/components/skill-card";
import type { RevealRefCallback } from "@/app/home/types";
import type { SkillCatalogEntry } from "@/lib/skills";

type SkillsSectionProps = {
  addRevealRef: RevealRefCallback;
  skills: SkillCatalogEntry[];
};

export function SkillsSection({
  addRevealRef,
  skills,
}: SkillsSectionProps) {
  return (
    <section
      id="skills"
      className="relative grid-bg px-6 py-24 md:py-32"
      style={{ background: "var(--surface)" }}
    >
      <div className="max-w-5xl mx-auto">
        <div ref={addRevealRef} className="reveal text-center mb-16">
          <p className="eyebrow mb-4">Skills Catalog</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold max-w-3xl mx-auto text-text-primary">
            Battle-tested patterns,
            <br className="hidden sm:block" /> ready to deploy.
          </h2>
          <p className="mt-5 text-lg text-text-secondary max-w-2xl mx-auto">
            Each skill is a fully documented architectural contract — not a
            snippet. Your agent reads it, understands the system, and builds it
            correctly the first time.
          </p>
        </div>

        <div className="space-y-6">
          {skills.length > 0 ? (
            skills.map((skill, index) => (
              <SkillCard
                addRevealRef={addRevealRef}
                key={skill.slug}
                skill={skill}
                transitionDelay={`${index * 100}ms`}
              />
            ))
          ) : (
            <div ref={addRevealRef} className="reveal">
              <div className="skill-card text-center py-10">
                <p className="text-text-secondary">
                  No skills were found in the library yet.
                </p>
              </div>
            </div>
          )}
        </div>

        <div ref={addRevealRef} className="reveal mt-6">
          <div
            className="skill-card flex items-center justify-center py-10"
            style={{ opacity: 0.6, cursor: "default" }}
          >
            <div className="text-center">
              <span className="status-badge coming-soon mb-3">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--accent-secondary)" }}
                />
                Coming Soon
              </span>
              <p className="text-text-tertiary text-sm mt-2">
                More skills are being battle-tested and documented. Watch the
                repo for updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

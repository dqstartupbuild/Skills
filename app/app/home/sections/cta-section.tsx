import { SOCIAL_LINKS } from "@/app/home/content";
import { GitHubIcon } from "@/app/home/components/icons";
import type { RevealRefCallback } from "@/app/home/types";
import { site } from "@/lib/site";

type CtaSectionProps = {
  addRevealRef: RevealRefCallback;
};

export function CtaSection({ addRevealRef }: CtaSectionProps) {
  return (
    <section
      id="cta"
      className="relative grid-bg px-6 py-28 md:py-36 text-center"
      style={{
        background:
          "radial-gradient(ellipse at 50% 100%, var(--accent-glow-strong) 0%, transparent 55%), radial-gradient(ellipse at 20% 80%, var(--accent-secondary-glow) 0%, transparent 40%), var(--background)",
      }}
    >
      <div className="max-w-3xl mx-auto">
        <div ref={addRevealRef} className="reveal">
          <p className="eyebrow mb-4">Get Started</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Give your agent
            <br className="hidden sm:block" />{" "}
            <span className="gradient-text">real architecture.</span>
          </h2>
          <p className="text-lg text-text-secondary max-w-xl mx-auto mb-10">
            Clone the repo. Pick a skill. Watch your AI agent ship
            production-grade code instead of improvised guesses.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              id="cta-button"
              href={site.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-base animate-pulse-glow"
            >
              <GitHubIcon width="18" height="18" />
              View on GitHub
            </a>
            <a
              href={SOCIAL_LINKS.x}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Follow @dqstartupbuild
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

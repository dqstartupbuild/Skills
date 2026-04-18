import type { RevealRefCallback } from "@/app/home/types";

type PhilosophySectionProps = {
  addRevealRef: RevealRefCallback;
};

export function PhilosophySection({
  addRevealRef,
}: PhilosophySectionProps) {
  return (
    <section
      id="philosophy"
      className="relative px-6 py-24 md:py-32"
      style={{ background: "var(--surface)" }}
    >
      <div className="max-w-3xl mx-auto">
        <div ref={addRevealRef} className="reveal">
          <p className="eyebrow mb-4">Philosophy</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-6">
            Skills aren&rsquo;t snippets.
            <br />
            They&rsquo;re{" "}
            <span className="gradient-text">architectural contracts.</span>
          </h2>
          <div className="space-y-4 text-text-secondary leading-relaxed">
            <p>
              We build &ldquo;Agentic Infrastructure&rdquo; — codified patterns
              that allow AI coding agents to execute complex, multi-step
              engineering tasks with production-grade precision.
            </p>
            <p>
              Every skill in this library follows the same contract: a
              structured{" "}
              <code className="mono text-accent" style={{ fontSize: "0.85em" }}>
                SKILL.md
              </code>{" "}
              entry point, reference documentation for each architectural layer,
              and verification steps to ensure correctness.
            </p>
            <p>
              The result? Your agent doesn&rsquo;t guess. It reads the contract,
              follows the pattern, and ships code that&rsquo;s indistinguishable
              from senior engineer output.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

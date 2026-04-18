import { HOME_STEPS } from "@/app/home/content";
import type { RevealRefCallback } from "@/app/home/types";

type HowItWorksSectionProps = {
  addRevealRef: RevealRefCallback;
};

export function HowItWorksSection({
  addRevealRef,
}: HowItWorksSectionProps) {
  return (
    <section id="how-it-works" className="relative grid-bg px-6 py-24 md:py-32">
      <div className="max-w-5xl mx-auto">
        <div ref={addRevealRef} className="reveal text-center mb-16">
          <p className="eyebrow mb-4">How It Works</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold max-w-3xl mx-auto text-text-primary">
            Three steps to
            <br className="hidden sm:block" />{" "}
            <span className="gradient-text">agentic precision.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {HOME_STEPS.map((step, index) => (
            <div
              ref={addRevealRef}
              key={step.number}
              className="reveal card group"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <span
                className="mono text-3xl font-bold block mb-4"
                style={{ color: "var(--accent)", opacity: 0.5 }}
              >
                {step.number}
              </span>
              <h3 className="text-lg font-bold text-text-primary mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

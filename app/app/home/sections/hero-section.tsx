import { HOME_AGENTS } from "@/app/home/content";
import { ArrowDownIcon, GitHubIcon } from "@/app/home/components/icons";
import { TerminalTypingEffect } from "@/app/home/components/terminal-typing-effect";
import { site } from "@/lib/site";

type HeroSectionProps = {
  installTargets: string[];
};

export function HeroSection({ installTargets }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative grid-bg flex flex-col items-center justify-center text-center px-6 pt-36 pb-20 md:pt-48 md:pb-28"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, var(--accent-glow-strong) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, var(--accent-secondary-glow) 0%, transparent 40%), var(--background)",
      }}
    >
      <div className="animate-fade-up delay-100 eyebrow mb-6">
        <span className="inline-block w-2 h-2 rounded-full" />
        Open Source &middot; Built for AI Agents
      </div>

      <h1 className="animate-fade-up delay-200 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold max-w-4xl leading-[1.02] tracking-tight text-text-primary">
        Agentic
        <br />
        <span className="gradient-text">Infrastructure</span>
      </h1>

      <p className="animate-fade-up delay-300 mt-6 text-lg md:text-xl max-w-2xl leading-relaxed text-text-secondary">
        Production-grade skills that turn AI coding agents into precision
        engineering tools. Codified patterns. Zero hallucination.
      </p>

      <div className="animate-fade-up delay-400 w-full max-w-xl mt-10">
        <div className="terminal text-left">
          <div className="terminal-bar">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="text-xs text-text-tertiary ml-2 mono">
              terminal
            </span>
          </div>
          <div className="terminal-body">
            <div>
              <span className="comment"># Add a skill to your agents</span>
            </div>
            <div>
              <span className="prompt">$</span>{" "}
              npx skills add{" "}
              <TerminalTypingEffect installTargets={installTargets} />
              <span className="cursor" />
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-up delay-500 flex flex-col sm:flex-row items-center gap-4 mt-8">
        <a id="hero-cta" href="#skills" className="btn-primary">
          Explore Skills
          <ArrowDownIcon width="16" height="16" />
        </a>
        <a
          href={site.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary"
        >
          <GitHubIcon width="16" height="16" />
          View on GitHub
        </a>
      </div>

      <div className="animate-fade-up delay-600 mt-12 flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs text-text-tertiary mr-1">Works with:</span>
        {HOME_AGENTS.map((agent) => (
          <span key={agent} className="tag">
            {agent}
          </span>
        ))}
      </div>
    </section>
  );
}

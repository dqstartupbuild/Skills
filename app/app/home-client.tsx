"use client";

import { useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/app/site-header";
import { SiteFooter } from "@/app/site-footer";
import { site } from "@/lib/site";
import type { SkillCatalogEntry } from "@/lib/skills";

/* ─── How it works steps ─── */
const STEPS = [
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
];

/* ─── Compatible agents ─── */
const AGENTS = [
  "Codex",
  "Claude Code",
  "Cursor",
  "Windsurf",
  "Gemini CLI",
  "+ More",
];

type HomeClientProps = {
  skills: SkillCatalogEntry[];
};

/* ─── Component ─── */
export function HomeClient({ skills }: HomeClientProps) {
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    revealRefs.current.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  const addRevealRef = (element: HTMLElement | null) => {
    if (element && !revealRefs.current.includes(element)) {
      revealRefs.current.push(element);
    }
  };

  const installTargets = skills.map((skill) => skill.installTarget);

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <SiteHeader variant="landing" />

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
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M19 12l-7 7-7-7" />
            </svg>
          </a>
          <a
            href={site.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            View on GitHub
          </a>
        </div>

        <div className="animate-fade-up delay-600 mt-12 flex flex-wrap items-center justify-center gap-3">
          <span className="text-xs text-text-tertiary mr-1">Works with:</span>
          {AGENTS.map((agent) => (
            <span key={agent} className="tag">
              {agent}
            </span>
          ))}
        </div>
      </section>

      <div className="section-divider" />

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
              snippet. Your agent reads it, understands the system, and builds
              it correctly the first time.
            </p>
          </div>

          <div className="space-y-6">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <div
                  ref={addRevealRef}
                  key={skill.slug}
                  className="reveal skill-card"
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-text-primary">
                          {skill.name}
                        </h3>
                        <span className={`status-badge ${skill.status}`}>
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              background:
                                skill.status === "stable"
                                  ? "var(--success)"
                                  : skill.status === "beta"
                                    ? "var(--warning)"
                                    : "var(--accent-secondary)",
                            }}
                          />
                          {skill.status}
                        </span>
                      </div>

                      <p className="text-text-secondary text-sm leading-relaxed mb-4">
                        {skill.description}
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
                        <div className="absolute right-3 opacity-50 group-hover:opacity-100 transition-opacity">
                          <CopyButton
                            textToCopy={`npx skills add ${skill.installTarget}`}
                          />
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
                            <svg
                              className="w-4 h-4 mt-0.5 shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="var(--success)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
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

      <div className="section-divider" />

      <section
        id="how-it-works"
        className="relative grid-bg px-6 py-24 md:py-32"
      >
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
            {STEPS.map((step, index) => (
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

      <div className="section-divider" />

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
                <code
                  className="mono text-accent"
                  style={{ fontSize: "0.85em" }}
                >
                  SKILL.md
                </code>{" "}
                entry point, reference documentation for each architectural
                layer, and verification steps to ensure correctness.
              </p>
              <p>
                The result? Your agent doesn&rsquo;t guess. It reads the
                contract, follows the pattern, and ships code that&rsquo;s
                indistinguishable from senior engineer output.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
              <a
                href="https://x.com/dqstartupbuild"
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

      <SiteFooter />
    </div>
  );
}

function TerminalTypingEffect({
  installTargets,
}: {
  installTargets: string[];
}) {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    const stringsToType =
      installTargets.length > 0
        ? installTargets
        : [`${site.skillInstallBase}/your-skill`];

    const currentStringIndex = loopNum % stringsToType.length;
    const fullText = stringsToType[currentStringIndex];

    const typingDelay = 80;
    const deletingDelay = 60;
    const pauseAfterTyping = 1700;
    const pauseBeforeTypingNew = 200;

    const baseSpeed = isDeleting ? deletingDelay : typingDelay;
    const typingSpeed = isDeleting ? baseSpeed : baseSpeed + Math.random() * 40;

    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      if (isDeleting) {
        setText(fullText.substring(0, text.length - 1));
      } else {
        setText(fullText.substring(0, text.length + 1));
      }
    };

    const prefix = `${site.skillInstallBase}/`;

    if (!isDeleting && text === fullText) {
      timer = setTimeout(() => setIsDeleting(true), pauseAfterTyping);
    } else if (isDeleting && text === prefix) {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }, pauseBeforeTypingNew);
    } else {
      timer = setTimeout(tick, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [installTargets, isDeleting, loopNum, text]);

  return <span className="string">{text}</span>;
}

function CopyButton({ textToCopy }: { textToCopy: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-text-tertiary hover:text-text-primary transition-colors flex items-center justify-center p-1 rounded"
      aria-label="Copy command"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--success)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

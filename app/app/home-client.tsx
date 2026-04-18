"use client";

import { CtaSection } from "@/app/home/sections/cta-section";
import { HeroSection } from "@/app/home/sections/hero-section";
import { HowItWorksSection } from "@/app/home/sections/how-it-works-section";
import { PhilosophySection } from "@/app/home/sections/philosophy-section";
import { SkillsSection } from "@/app/home/sections/skills-section";
import { useRevealObserver } from "@/app/home/use-reveal-observer";
import { SiteFooter } from "@/app/site-footer";
import { SiteHeader } from "@/app/site-header";
import type { SkillCatalogEntry } from "@/lib/skills";

type HomeClientProps = {
  skills: SkillCatalogEntry[];
};

export function HomeClient({ skills }: HomeClientProps) {
  const addRevealRef = useRevealObserver();
  const installTargets = skills.map(({ installTarget }) => installTarget);

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      <SiteHeader variant="landing" />
      <HeroSection installTargets={installTargets} />
      <div className="section-divider" />
      <SkillsSection addRevealRef={addRevealRef} skills={skills} />
      <div className="section-divider" />
      <HowItWorksSection addRevealRef={addRevealRef} />
      <div className="section-divider" />
      <PhilosophySection addRevealRef={addRevealRef} />
      <div className="section-divider" />
      <CtaSection addRevealRef={addRevealRef} />
      <SiteFooter />
    </div>
  );
}

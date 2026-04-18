# Setup Blog SEO Foundation Skill

A highly opinionated, reusable infrastructure for Next.js App Router projects that provides a battle-tested foundation for blog content, SEO optimization, and discovery.

## 🚀 Overview

This skill automates the setup of a professional content delivery system. It ensures clean separation of concerns between site constants, content logic, metadata generation, and security headers, resulting in a high-performance, crawlable, and secure site.

### Key Features
- **MDX Pipeline**: Powered by `@content-collections/core` with Zod validation.
- **Metadata Engine**: Centralized helpers for titles, descriptions, canonicals, and OG images.
- **Security Headers**: Managed CSP and security headers configuration in `next.config.ts`.
- **Discovery Layer**: Automated `sitemap.ts`, `robots.ts`, RSS feeds (`feed.xml`), and `llms.txt`.
- **Premium SEO**: Integrated JSON-LD (Schema.org) for articles and landing pages.

## 📦 Installation

To add this skill to all your local agents (Claude Code, Cursor, Windsurf, etc.), run the following command:

```bash
npx skills add https://github.com/dqstartupbuild/skills/library/seo-setup
```

## 🛠️ Usage

This skill should be invoked when:
1. **Starting a new project**: Setting up the architectural bones for content and SEO.
2. **Adding a blog**: Integrating MDX-based article collections.
3. **SEO Refactoring**: Moving from ad-hoc metadata to a structured, helper-driven system.

### Triggering the Skill
The agent will automatically recognize your intent when you ask to "set up a blog," "configure SEO," or "add security headers to a Next.js app."

## 🧩 Architectural Principles

- **Single Source of Truth**: All site constants (URLs, brand names) live in `lib/site.ts`.
- **Thin Pages**: Routing components should remain minimal, delegating logic to query helpers (`lib/content/queries.ts`).
- **Standardized Metadata**: Strict enforcement of character lengths (Titles: 50-70, Descriptions: 110-170) and absolute canonical URLs.

## 📂 Repository Structure

- `SKILL.md`: The primary instruction file for the AI agent.
- `references/`: Specialized playbooks for each architectural layer.
  - `implementation-checklist.md`: The ordered sequence for successful setup.
  - `source-map.md`: Recommended file structure and responsibility split.
  - `content-contract.md`: Frontmatter schema and editorial rules.
  - `security-and-discovery.md`: CSP, security headers, and crawler optimization.

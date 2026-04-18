# Open Graph Images Skill

A comprehensive toolset and guidance for generating, managing, and wiring OpenGraph (OG) images for web applications. This skill focuses on building high-quality, brand-consistent social preview images that are committed directly to your repository or served via framework-native dynamic routes.

## 🚀 Overview

This repository provides the infrastructure to:
- **Detect** OG targets across various web frameworks (Next.js, Astro, Remix, etc.).
- **Generate** static 1200x630 social images by capturing the exact browser preview used in the OG Studio.
- **Implement** an "OG Studio" hub for reviewing and importing images before they go live.
- **Wire** generated assets into the application's metadata systems (App Router, Pages Router, SEO helpers).

## 📂 Repository Structure

Below is a breakdown of every file in this repository and its role in the OG image generation workflow.

### 📄 Core Files
- **[SKILL.md](SKILL.md)**: The primary instruction manual for the Antigravity AI assistant. It contains the logic, decision matrices, and safety checks for performing OG image tasks.
- **[README.md](README.md)**: This file! Provides a human-readable overview of the repository.

### 🛠️ Scripts
- **[scripts/detect_og_targets.py](scripts/detect_og_targets.py)**: A Python utility that scans a target repository to identify frameworks, routes, existing OG assets, and SEO wiring. It recommends the best integration strategy.

### 📦 Assets (Templates & Examples)
These files are stored as `.example` files to avoid type-checking issues in this repository. They are intended to be copied and renamed in the target project.

#### **OG Studio Hub (Next.js App Router)**
The following files comprise a local-only "Studio" where users can preview and manage OG cards:
- **[assets/next-app-router-og-hub/app/og-studio/page.tsx.example](assets/next-app-router-og-hub/app/og-studio/page.tsx.example)**: The main entry point for the OG Studio UI.
- **[assets/next-app-router-og-hub/app/og-studio/OgStudioClientPage.tsx.example](assets/next-app-router-og-hub/app/og-studio/OgStudioClientPage.tsx.example)**: The interactive client-side grid that previews cards and imports exact browser renders.
- **[assets/next-app-router-og-hub/app/og-studio/client-utils.ts.example](assets/next-app-router-og-hub/app/og-studio/client-utils.ts.example)**: `html-to-image` capture helpers that wait for fonts and nested images before export.
- **[assets/next-app-router-og-hub/app/og-studio/[key]/page.tsx.example](assets/next-app-router-og-hub/app/og-studio/[key]/page.tsx.example)**: Local-only full-size preview route for one target.
- **[assets/next-app-router-og-hub/app/og-studio/[key]/OgStudioPreviewClient.tsx.example](assets/next-app-router-og-hub/app/og-studio/[key]/OgStudioPreviewClient.tsx.example)**: Full-preview client that re-imports the exact single-card browser render.
- **[assets/next-app-router-og-hub/app/api/og/import/route.ts.example](assets/next-app-router-og-hub/app/api/og/import/route.ts.example)**: POST-only import endpoint that writes captured PNG buffers into the repo.
- **[assets/next-app-router-og-hub/lib/og/card.tsx.example](assets/next-app-router-og-hub/lib/og/card.tsx.example)**: Browser-safe shared OG card renderer used by the studio.
- **[assets/next-app-router-og-hub/lib/og/importer.ts.example](assets/next-app-router-og-hub/lib/og/importer.ts.example)**: Final file-write helper used by the POST import route.
- **[assets/next-app-router-og-hub/lib/og/targets.ts.example](assets/next-app-router-og-hub/lib/og/targets.ts.example)**: Typed target registry plus imported-state lookup.

#### **Dynamic Routes**
- **[assets/next-app-router-og-hub/app/blog/[slug]/opengraph-image.tsx.example](assets/next-app-router-og-hub/app/blog/[slug]/opengraph-image.tsx.example)**: A template for generating dynamic social images on-the-fly for content-heavy routes using `next/og`.

### 📚 References
- **[references/next-app-router-og-hub.md](references/next-app-router-og-hub.md)**: Detailed guidance on implementing the "Review-First" workflow in Next.js applications.

## 🏗️ Core Principles

1. **Repo-Native**: Images should live in the repository (e.g., `public/og/` or route-local `opengraph-image.png`), not as external hosted assets.
2. **Review-First**: By default, build an **OG Hub** to let users approve designs and copy before they are wired into production metadata.
3. **Preview Parity**: For static OG hubs, import the exact browser preview instead of re-rendering it through a second image engine.
4. **Poster Design**: OG images should look like high-quality posters—large text, clear branding, and minimal clutter—not just page screenshots.

## 🛠️ Getting Started for Assistants

1. **Inventory**: Run `python3 scripts/detect_og_targets.py <path_to_repo>` to understand the current state.
2. **Strategy**: Consult the Recommendation Matrix in `SKILL.md` to choose between Static Imports or Dynamic Routes.
3. **Implement**: Use the templates in `assets/` to build the studio and generators.
4. **Verify**: Confirm that the imported PNGs match the browser preview and that metadata points to the new assets.

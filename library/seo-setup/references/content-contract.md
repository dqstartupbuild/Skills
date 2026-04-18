# Content Contract

Use this file when defining MDX collections, frontmatter, or editorial metadata rules.

## Shared Frontmatter Fields

Use a shared SEO contract across content types.

| Field | Notes |
| --- | --- |
| `title` | Human-facing article title or H1 source. |
| `seoTitle` | SEO-facing title used in metadata. Keep it between 50 and 70 characters. Use this field so the search title can stay compliant even when the on-page `title` is longer or more expressive. |
| `slug` | Lowercase hyphenated slug only. |
| `description` | Meta description and article summary. Keep it between 110 and 170 characters. |
| `date` | `YYYY-MM-DD`. |
| `updated?` | Optional update date, same format. |
| `draft` | Defaults to `false`; drafts are filtered out by query helpers. |
| `author` | Display author name. |
| `category` | Content bucket used in the UI. |
| `tags` | Non-empty string array. |
| `image` | Source image path. Keep OG asset resolution separate from this field. |
| `canonical` | Absolute URL. |
| `targetKeyword` | Primary search phrase used for content strategy and related-content scoring. |
| `intent` | A project-defined search-intent enum such as `informational`, `commercial`, `comparison`, or `transactional`. |
| `ctaVariant` | A project-defined CTA variant enum. |
| `faq?` | Optional array of `{ question, answer }` used for FAQ JSON-LD and MDX rendering. |
| `relatedSlugs` | Optional slug list; defaults to `[]`. |
| `schemaTypeHints` | One or more schema hints such as `article`, `faq`, or `comparison`. |

## Blog-Specific Fields

| Field | Notes |
| --- | --- |
| `excerpt?` | Optional short summary. |
| `featured` | Defaults to `false`. |

## Optional Comparison Extension

If the project includes comparison or alternative pages, add fields such as:

| Field | Notes |
| --- | --- |
| `comparisonTarget` | Competitor or alternative being compared. |
| `comparisonTargetUrl?` | Optional product URL. |
| `verdict` | Summary judgment for the comparison page. |
| `alternatives` | Non-empty array of related competitors. |

If the project only needs a blog, omit the comparison collection and keep the rest of the architecture.

## Sample Blog Frontmatter

```mdx
---
title: How to Get Your First Pull-Up
seoTitle: How to Get Your First Pull-Up with a Simple Beginner Plan
slug: how-to-get-your-first-pull-up
description: Build your first pull-up with assisted progressions, scapular control, and a repeatable weekly plan designed for beginners training at home.
date: 2026-03-07
author: Editorial Team
category: exercise-progressions
tags:
  - pull-ups
  - beginners
  - calisthenics
image: /og/default.png
canonical: https://www.example.com/blog/how-to-get-your-first-pull-up
targetKeyword: how to get your first pull up
intent: informational
ctaVariant: primary
excerpt: A realistic beginner guide to building the strength for a first pull-up.
featured: false
faq:
  - question: How long does it take to get a first pull-up?
    answer: It depends on your starting strength and bodyweight, but steady weekly practice matters more than any specific timeline.
relatedSlugs:
  - best-beginner-calisthenics-exercises
schemaTypeHints:
  - article
  - faq
---
```

## Authoring Constraints

- Keep MDX files under `content/blog/` and optionally additional content collections such as `content/comparisons/`.
- Keep components registered globally in the MDX component factory; do not import components inside MDX files.
- Keep FAQ data in frontmatter when the same questions should power both the page body and JSON-LD.
- Keep `relatedSlugs` explicit when internal-link priorities matter.
- Add a `content/README.md` author guide or cover the same rules in the repo-level `README.md` and/or `AGENTS.md`.
- Treat `seoTitle` as the search-result title. Keep it between 50 and 70 characters.
- Allow the on-page `title` and H1 to be longer than 70 characters when editorial clarity or persuasion benefits from it.
- Keep `description` between 110 and 170 characters. If the page needs a longer intro, put that in the body instead of stretching the metadata description.
- Apply the same title/description length rules to metadata for non-content pages such as pricing, tools, feature, and landing pages.
- Document these rules and the full blog/SEO setup in the target repo's `AGENTS.md` and/or `README.md`.

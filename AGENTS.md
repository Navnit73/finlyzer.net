<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Design System & Component Guidelines (VEED-Inspired Financial Tool Hub)

Whenever creating or modifying new UI components, layouts, or pages, **ALWAYS USE THE CSS VARIABLE COLORS AND TOKENS DEFINED IN `src/app/globals.css`** (as specified in `design.md`).

## Core Color Variables & Usage Rules

1. **Brand Action Color (Primary CTA / Accents):**
   - Main Action: `var(--color-brand)` (`#70F000` vivid lime) or Tailwind `bg-brand` / `text-brand`
   - Text on Brand: `var(--color-on-brand)` (`#141414`)
   - Hover State: `var(--color-brand-hover)` (`#61D900`)
   - Soft Highlight / Badges: `var(--color-brand-soft)` (`#E9FFD6`)
   - *Rule:* Reserve lime for primary actions, active indicators, and small UI accents. Do NOT use lime as a page-wide background.

2. **Typography & Dark Elements (Ink):**
   - Primary Text & Dark Surfaces: `var(--color-ink)` (`#171717`) or Tailwind `text-ink` / `bg-ink`
   - Charcoal Cards (Dark Sections): `var(--color-ink-soft)` (`#303030`)
   - Supporting Body Text: `var(--color-text-secondary)` (`#777777`)
   - Muted Metadata / Helper Copy: `var(--color-text-muted)` (`#969696`)
   - Text on Dark Backgrounds: `var(--color-on-dark)` (`#FFFFFF`)

3. **Surfaces & Borders (Canvas):**
   - Main Background: `var(--color-surface)` (`#FFFFFF`)
   - Subtle Neutral Panels: `var(--color-surface-subtle)` (`#F5F5F5`)
   - Grouped Card Surfaces: `var(--color-surface-muted)` (`#EFEFEF`)
   - Dividers & Outlines: `var(--color-border)` (`#E5E5E5`)

4. **Supporting Financial / Chart Accents:**
   - Blue: `var(--media-blue)` (`#8FC5EE`)
   - Violet: `var(--media-violet)` (`#7654E8`)
   - Pink: `var(--media-pink)` (`#F25D9A`)
   - Orange: `var(--media-orange)` (`#FF6B55`)
   - Deep Purple: `var(--media-deep-purple)` (`#52106B`)

## Ready-to-Use UI Utility Classes

- `.btn-brand-primary` — Rounded pill lime button with dark text (`#70F000` / `#141414`)
- `.btn-brand-secondary` — Light gray neutral pill button (`#F5F5F5` / `#171717`)
- `.btn-brand-dark` — Dark rounded pill button (`#171717` / `#FFFFFF`)
- `.site-container` — 1440px max-width container with responsive fluid padding
- `.intro-panel` — Light gray grouped panel (`#F5F5F5`, 20px radius)
- `.dark-editorial-section` & `.dark-editorial-card` — Charcoal card grid on near-black background
- `.feature-badge` — Pill tag with soft lime background and dark text

**Rule for New Components:** Never hardcode random arbitrary colors. Always use the CSS variables or Tailwind theme classes above.

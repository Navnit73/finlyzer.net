<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Design System & Component Guidelines (Apple-Inspired)

Whenever creating or modifying UI components, layouts, or pages, **ALWAYS USE THE CSS VARIABLE COLORS AND TOKENS DEFINED IN `src/app/globals.css`**, following `design.md` (adapted from `apple/DESIGN.md`).

## Core Color Variables & Usage Rules

1. **Action Blue (the single accent):** `var(--color-brand)` (`#0071e3`) for primary buttons, active indicators and focus; `var(--color-brand-dark)` (`#0066cc`) for blue text and links; `var(--color-brand-soft)` (`#e8f2fd`) for selected/info tints paired with `--color-brand-dark` text. `var(--color-on-brand)` (white) only on `--color-brand` fills. Never use blue decoratively.
2. **Ink & text:** `var(--color-ink)` (`#1d1d1f`) headings and emphasis; `var(--color-text-secondary)` (`#515154`) body; `var(--color-text-muted)` (`#6e6e73`) metadata.
3. **Surfaces:** `var(--color-surface)` white canvas; `var(--color-surface-subtle)` (`#f5f5f7`) parchment bands, sidebar, footer; `var(--color-surface-muted)` (`#e8e8ed`) neutral fills; `var(--color-border)` (`#e0e0e5`) hairlines.
4. **Status:** `--color-success|danger|warning|info` with `-soft` and `-border` variants. Status only.
5. **Dark tiles:** wrap in `.surface-dark`; tokens re-scope automatically.

## Ready-to-Use UI Classes

- Buttons: `.btn-brand-primary` (blue pill), `.btn-brand-secondary` (neutral pill), `.btn-brand-dark` (ink pill), `.btn-brand-ghost` (blue outline pill). daisyUI `btn` for compact utility actions.
- Layout: `.site-container` (1200px), `.site-container-wide` (1440px), `.site-container-text` (720px), `.section`, `.section-parchment`, `.hairline-t`, `.hairline-b`.
- Type: `.type-hero`, `.type-display`, `.type-title`, `.type-headline`, `.type-lead`, `.type-body`, `.type-caption`, `.eyebrow`, `.link`.
- Surfaces: `.card-surface`, `.intro-panel`, `.surface-overlay`, `.surface-frosted`, `.surface-dark`, `.feature-badge`, `.skeleton-line`.

**Rules:** no hardcoded hex, no `font-bold`/`font-extrabold`/`font-black` (use `font-semibold` max), no uppercase eyebrows, no decorative shadows or gradients, radius ≤ 18px (`rounded-2xl`). Prefer whitespace and hairlines over cards.

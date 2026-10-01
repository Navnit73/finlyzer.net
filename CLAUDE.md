# Finlyzer Project Guidelines

@AGENTS.md

## Design System & Color Variables Rule

Whenever creating or modifying any new component, page, or layout:
- **ALWAYS use the CSS variable colors defined in `src/app/globals.css`** (e.g. `var(--color-brand)`, `var(--color-ink)`, `var(--color-surface)`, `var(--color-border)`, etc.) or their Tailwind `@theme` aliases (`bg-brand`, `text-ink`, `bg-surface-subtle`, `text-text-secondary`, etc.).
- Never hardcode arbitrary hex colors.
- Follow the VEED-inspired financial tool hub specifications in `design.md`.

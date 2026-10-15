# Design System — Finlyzers (Apple-inspired)

> Source analysis: `apple/DESIGN.md` (installed with `npx getdesign@latest add apple`).
> This document adapts those principles to Finlyzers' product: a financial tool hub with
> public SEO pages, a signed-in workspace and an admin console. Tokens live in
> `src/app/globals.css`; never hardcode hex values in components.

## 1. Principles

- **Quiet chrome, clear content.** UI recedes; the user's statement, numbers and actions lead.
- **One accent.** Action Blue (`--color-brand`) is the only interactive color: primary buttons,
  links, focus rings, active nav, selected states. Nothing decorative is blue.
- **Hierarchy through type and space, not boxes.** Prefer whitespace, alignment and 1px hairlines
  over cards. Not every section is a card.
- **Flat.** No decorative shadows, gradients, glass, blobs or glows. Only floating layers
  (menus, popovers, dialogs, toasts) carry `--shadow-overlay`.
- **Restrained weights.** 400 for body, 500 for UI labels/buttons, 600 for headings and emphasis.
  Never 700+ (`font-bold`, `font-extrabold`, `font-black` are not used).
- **Sentence case.** No all-caps eyebrows or wide letter-spacing. Headlines track slightly tight.

## 2. Color tokens

| Token | Value | Use |
|---|---|---|
| `--color-ink` | `#1d1d1f` | Headlines, body emphasis, dark buttons |
| `--color-text-secondary` | `#515154` | Body copy, descriptions |
| `--color-text-muted` | `#6e6e73` | Metadata, helper text, table headers (AA on white & parchment) |
| `--color-surface` | `#ffffff` | Page canvas, cards |
| `--color-surface-subtle` | `#f5f5f7` | Parchment: alternating sections, grouped panels, footer, sidebar |
| `--color-surface-muted` | `#e8e8ed` | Secondary button fill, hover rows, progress tracks |
| `--color-border` | `#e0e0e5` | Hairlines, card and input borders |
| `--color-border-subtle` | `#ececf0` | Table row separators |
| `--color-border-hover` | `#c7c7cc` | Hovered borders |
| `--color-brand` | `#0071e3` | Primary button fill, active indicators, focus |
| `--color-brand-hover` | `#0077ed` | Primary hover |
| `--color-brand-dark` | `#0066cc` | Blue text and links on light surfaces |
| `--color-brand-soft` | `#e8f2fd` | Selected rows/chips, info tints (pair with `--color-brand-dark` text) |
| `--color-on-brand` | `#ffffff` | Text on `--color-brand` only |
| Semantic | `--color-success/-danger/-warning/-info` + `-soft` / `-border` | Status only |

`--media-*` tokens are retained for charts and status tints; `--media-violet*` now maps to the
neutral ink family so legacy "secondary accent" usage reads as neutral.

**Dark tiles:** wrap a section in `.surface-dark` (or `.dark-editorial-section`). It re-scopes the
tokens (ink → light, borders → dark, brand text → `#2997ff`) so components inside just work.

## 3. Typography

System stack: SF Pro on Apple platforms, Inter (`--font-inter`) elsewhere. Mono: SF Mono / Menlo.

| Class | Size | Weight | Use |
|---|---|---|---|
| `.type-hero` | 36 → 64px | 600, −0.028em | One per page: the H1 of a marketing page |
| `.type-display` | 30 → 48px | 600 | Section headlines on marketing pages |
| `.type-title` | 24 → 32px | 600 | App page titles, sub-sections |
| `.type-headline` | 21px | 600 | Card / group headings |
| `.type-lead` | 17 → 21px | 400 | Hero/section intro copy (secondary color) |
| `.type-body` | 17px | 400 | Long-form paragraphs |
| `.type-caption` | 13px | 400 | Metadata, footnotes |
| `.eyebrow` | 14px | 600, blue | Optional short kicker above a headline (sentence case) |

App UI uses Tailwind sizes: `text-sm` (14) for controls/tables, `text-[13px]` for metadata,
`text-xs`/`text-[11px]` minimum for badges. Use `tabular-nums` for amounts.

## 4. Layout & spacing

- Containers: `.site-container` (1200px), `.site-container-wide` (1440px, data-heavy pages),
  `.site-container-text` (720px, prose). Gutter `--page-gutter` (16 → 48px).
- Sections: `.section` (vertical rhythm `--section-y`, 56 → 104px); alternate white and
  `.section-parchment` instead of drawing boxes. Use `.hairline-t` / `.hairline-b` between bands.
- 8px base grid. Card padding 24px (16px on mobile). Grid gaps 16–24px.
- Breakpoints: Tailwind defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280).

## 5. Shape & elevation

Radius: `rounded-md` 8px (utility buttons, inputs, small chips) · `rounded-lg` 12px (controls,
list items, small cards) · `rounded-2xl` 18px (cards, panels, dialogs) · `rounded-full` (pill CTAs,
badges, avatars). Nothing larger.

Shadows: `shadow-xs`/`2xs` are intentionally flat. Floating layers use `.surface-overlay` or
`shadow-xl`/`shadow-2xl` (both tuned soft). Never shadow static cards or buttons.

## 6. Components

- **Buttons:** `.btn-brand-primary` (blue pill, 44px), `.btn-brand-secondary` (neutral fill pill),
  `.btn-brand-dark` (ink pill), `.btn-brand-ghost` (blue outline pill, the second of two CTAs).
  Press state `scale(0.97)`; disabled at 40% opacity. daisyUI `btn` is the compact 8px utility
  rect for toolbars and tables.
- **Links:** `.link` — blue, no underline until hover. In prose, links are blue text.
- **Cards:** `.card-surface` (white, hairline, 18px). Grouped panel: `.intro-panel` (parchment).
- **Overlays:** `.surface-overlay` for menus/popovers; daisyUI `modal-box` is pre-styled.
- **Navigation:** frosted sticky bar (`.surface-frosted` + `hairline-b`, 52px). App sidebar on
  parchment with blue-tinted active item (`bg-[var(--color-brand-soft)] text-[var(--color-brand-dark)]`).
- **Inputs:** 44px tall, 12px radius, `--color-border`, blue focus ring (`--focus-ring`).
- **Tables:** no zebra, hairline row separators, muted 13px headers in sentence case, numeric
  columns right-aligned with `tabular-nums`.
- **Badges:** pill, 12px/500, soft tint + matching text token (e.g. success-soft + success).
- **Empty / loading / error states:** centered, an icon in a 40px neutral circle, a 17px/600 title,
  one line of secondary text, one action. Skeletons use `.skeleton-line`.

## 7. Motion & accessibility

- Transitions 180–280ms with `--ease-apple`; animate opacity/transform only.
- `prefers-reduced-motion` is honored globally in `globals.css`.
- Focus: 2px blue outline (`:focus-visible`), inputs use the blue ring.
- Touch targets ≥ 44px on mobile. Text contrast ≥ 4.5:1 (all text tokens comply on white and parchment).

## 8. Don'ts

Lime or other secondary accents · gradients · glassmorphism beyond the nav · decorative shadows ·
radii above 18px · weight 700+ · uppercase eyebrows · cards nested in cards · hardcoded hex.

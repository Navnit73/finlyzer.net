# Design System — VEED-Inspired financial tool hub

> Reference: five supplied screenshots of VEED pages (video editor, SEO/content sections, feature sections, dark editorial cards, and video ad maker).
> This document translates the visible patterns into an implementation-ready design guide. Colors are visual estimates from screenshots; validate against source assets before treating them as exact brand values.

## 1. Design direction

A modern, high-contrast SaaS marketing site for an online video editor and AI video tools.

- **Personality:** confident, creator-focused, direct, approachable, product-led.
- **Visual language:** clean white canvas, near-black typography, restrained neutral surfaces, vivid lime-green action color, rounded controls, large editorial headings, product imagery.
- **Primary experience:** guide visitors from a clear value proposition to a single primary action (start editing / create video).
- **Avoid:** excessive gradients, glassmorphism, ornamental shadows, overly dense cards, inconsistent corner radii, or multiple competing CTA colors.

## 2. Color system

### Core palette

| Token | Hex | Usage |
|---|---|---|
| `color.ink` | `#171717` | Primary text, dark buttons, dark sections |
| `color.ink-soft` | `#303030` | Dark card surfaces, secondary dark backgrounds |
| `color.text-secondary` | `#777777` | Supporting copy, breadcrumb text |
| `color.text-muted` | `#969696` | Muted metadata and helper text |
| `color.surface` | `#FFFFFF` | Main page background, cards |
| `color.surface-subtle` | `#F5F5F5` | Neutral panels, secondary CTA |
| `color.surface-muted` | `#EFEFEF` | Feature intro panel, muted card areas |
| `color.border` | `#E5E5E5` | Dividers, outlines, control borders |
| `color.brand` | `#70F000` | Primary CTA, active states, key UI accents |
| `color.brand-hover` | `#61D900` | Hover state for primary CTA |
| `color.brand-soft` | `#E9FFD6` | Soft highlight backgrounds, icon chips |
| `color.on-brand` | `#141414` | Text/icons on lime CTA |
| `color.on-dark` | `#FFFFFF` | Text on dark surfaces |

### Supporting colors visible in product imagery

These are illustrative supporting colors for previews and thumbnails, not global interface colors:

| Token | Hex | Usage |
|---|---|---|
| `media.blue` | `#8FC5EE` | Video preview skies / cool media backgrounds |
| `media.violet` | `#7654E8` | AI tool illustrations and media panels |
| `media.pink` | `#F25D9A` | Promotional video preview accents |
| `media.orange` | `#FF6B55` | Ad-maker preview accents |
| `media.deep-purple` | `#52106B` | Promotional headline overlay |

### Color usage rules

1. Keep most page surfaces white; use pale gray only to group content or distinguish a section.
2. Reserve bright lime for the main action, selected states, and small product UI accents.
3. Use near-black for primary text and primary dark controls.
4. Body copy should use medium gray, not very light gray; maintain readable contrast.
5. Dark sections use near-black backgrounds, charcoal cards, white headings, and muted gray descriptions.
6. Avoid applying lime to large backgrounds. Use it as a high-salience accent.

## 3. Typography

### Typeface

Use a clean geometric/grotesk sans-serif similar to the reference. Recommended implementation stack:

```css
font-family: Inter, "Helvetica Neue", Arial, sans-serif;
```

Use a supplied brand font if available. Keep headings tight and heavy; body copy should be regular weight with comfortable line-height.

### Type scale

| Token | Desktop size | Weight | Line height | Use |
|---|---:|---:|---:|---|
| `type.display` | 60–68px | 700–800 | 0.98–1.05 | Main hero title |
| `type.h1` | 52–60px | 700–800 | 1.02–1.08 | Secondary hero / page title |
| `type.h2` | 38–44px | 650–750 | 1.08–1.15 | Feature section headings |
| `type.h3` | 28–34px | 650–700 | 1.12–1.2 | Card headings / editorial titles |
| `type.h4` | 20–24px | 600–700 | 1.2–1.3 | Small section headings |
| `type.body-lg` | 18–20px | 400 | 1.4–1.5 | Hero descriptions |
| `type.body` | 16–18px | 400 | 1.45–1.6 | Standard body copy |
| `type.small` | 14–15px | 400–500 | 1.4–1.5 | Breadcrumbs, helper text |
| `type.caption` | 12–13px | 500 | 1.35–1.4 | Labels, badges, metadata |

### Typography rules

- Hero headings are bold, large, and usually constrained to 8–10 words per line.
- Use sentence case for headings and CTA labels.
- Keep body paragraphs around 55–75 characters per line.
- Use underlined text only for inline links or emphasized feature terms.
- Avoid all-caps except short labels or logos.

## 4. Layout and spacing

### Global container

- Maximum content width: **1360–1440px**.
- Desktop side gutters: **7–9vw**, capped around 150px.
- Tablet gutters: **32–48px**.
- Mobile gutters: **20–24px**.
- Header content aligns to the same horizontal container as page content.

### Spacing scale

Use a 4px base unit.

| Token | Value |
|---|---:|
| `space.1` | 4px |
| `space.2` | 8px |
| `space.3` | 12px |
| `space.4` | 16px |
| `space.5` | 20px |
| `space.6` | 24px |
| `space.8` | 32px |
| `space.10` | 40px |
| `space.12` | 48px |
| `space.16` | 64px |
| `space.20` | 80px |
| `space.24` | 96px |
| `space.32` | 128px |

### Section rhythm

- Header height: approximately 72–88px on desktop.
- Hero top spacing: 64–96px after breadcrumb or header.
- Standard section padding: 96–128px vertical desktop; 64–80px mobile.
- Large content blocks should have generous whitespace between them.
- Alternate content/image sections to create a clear visual rhythm.

## 5. Header and navigation

### Structure

- White horizontal header with VEED-style wordmark at left.
- Main navigation centered or slightly left of center:
  - Create with AI
  - Ads & templates
  - Tools
  - Enterprise
  - Pricing
- Account actions at right:
  - Login as a plain text link
  - Sign Up as a dark rounded pill button
- Dropdown chevrons for expandable navigation items.
- Optional thin promotional announcement bar above the header, with dark background, centered message, external-link icon, and close control.

### Styling

- Header background: `#FFFFFF`.
- Navigation text: `#292929`, 16–18px, medium weight.
- Logo: black wordmark.
- Sign Up: `#171717` background, white text, pill radius.
- Keep header visually quiet; avoid heavy borders and shadows.
- On scroll, sticky behavior is optional; if enabled, preserve the same height and surface.

## 6. Breadcrumbs

- Small 14–15px gray text.
- Use subtle chevron separators.
- Place below header with 24–36px top spacing.
- Current page label can use slightly darker gray.
- Hide or truncate intermediate crumbs on narrow screens.

## 7. Hero patterns

### A. Tool landing hero (video editor / video ad maker)

Two-column desktop layout:
- Left: trust indicator, headline, short description, primary CTA, optional secondary CTA/helper text.
- Right: large product screenshot or video preview with rounded corners.
- Approximate split: 52% text / 48% media, with a 64–96px gap.
- Vertically center both columns.

**Trust indicator**
- Small overlapping creator avatars or circular user portraits.
- Supporting text such as “Trusted by 1M+ creators”.
- Text 15–16px, muted gray.

**Headline**
- 58–68px, bold, tight line height.
- Max width around 560px.
- Two or three lines maximum at desktop.

**Description**
- 18px, gray, line-height 1.4–1.5.
- Max width around 600px.
- Explain the key value proposition and 2–3 capabilities.

**Primary CTA**
- Lime fill, black text, 16–18px medium/semibold.
- Rounded pill or 28–36px radius.
- Height 64–72px; horizontal padding 32–40px.
- Include a right arrow when appropriate.
- Optional helper copy beside or beneath CTA, e.g. “No credit card required”.

**Secondary CTA**
- Light gray surface, dark text.
- Same height as primary CTA.
- Use only when there is a meaningful second action.

### B. Text-led intro panel

- Full-width light-gray panel (`#F2F2F2`) with 16–20px radius.
- Two columns: heading left, explanatory copy right.
- Generous internal padding (28–48px).
- Heading around 38–42px; body around 17–18px.
- Use a separate section title below the panel to introduce the next content block.

### C. Feature detail split section

- Two columns with large image/product visual on one side and copy on the other.
- Alternate image position across successive sections.
- Heading 38–44px.
- Body 17–18px, line-height 1.5.
- Text links are underlined, near-black, and integrated naturally into copy.
- Keep visuals large enough to communicate the product, not merely decorate.

## 8. Product imagery and media previews

- Use real product screenshots, editor UI captures, or polished illustrative previews.
- Image corners: 12–18px.
- Use a 16:9 or 4:3 aspect ratio depending on the editor UI.
- Keep screenshots crisp; avoid excessive drop shadows.
- Product screenshots may contain lime highlights to connect them to the CTA color.
- For image/video cards, crop intentionally with `object-fit: cover`.
- Use subtle borders when a white image blends into the page.
- Provide alt text that describes the tool or task represented.

## 9. Buttons and interactive controls

### Primary button

```css
.button-primary {
  background: #70F000;
  color: #141414;
  border: 0;
  border-radius: 999px;
  min-height: 64px;
  padding: 0 36px;
  font-size: 17px;
  font-weight: 600;
}
.button-primary:hover { background: #61D900; }
.button-primary:focus-visible {
  outline: 3px solid #171717;
  outline-offset: 3px;
}
```

### Secondary button

- Background: `#F1F1F1`.
- Text: `#171717`.
- Border: none or subtle `#E5E5E5`.
- Same height and radius as primary button.

### Dark button

- Background: `#171717`.
- Text: white.
- Use for account/signup or low-frequency utility actions.

### Interaction states

- Hover: slight color shift, no dramatic scaling.
- Focus: clear 2–3px outline with offset.
- Disabled: neutral gray fill and muted text; do not rely on opacity alone.
- Active/selected: lime accent or dark text with clear visual indication.

## 10. Cards and content grids

### Light content card

- White background.
- Border: `1px solid #E7E7E7` only when needed.
- Radius: 14–18px.
- Image at top, followed by title, description, CTA.
- Internal padding: 24–28px.
- Use consistent image aspect ratios across a grid.

### Dark editorial card section

Shown in the reference “More from VEED” area:
- Full-width near-black section background (`#111111`).
- Centered white section heading.
- Three-column grid on desktop.
- Cards use charcoal surface (`#303030`) and 14–18px radius.
- Image at top with 12px radius.
- White title, gray summary, lime “Learn More” button.
- Consistent card heights and aligned CTA baselines.
- Tablet: two columns; mobile: one column or horizontal carousel.

### Logo / trust strip

- Place below hero or CTA area.
- Include review score panel and customer/partner logos.
- Use monochrome logos in black/gray; preserve each logo's proportions.
- Horizontal distribution with ample whitespace.
- On mobile, allow horizontal scroll or wrap into two rows.
- Do not imply endorsement beyond the actual relationship represented.

## 11. Backgrounds and section treatments

| Section type | Background |
|---|---|
| Main marketing canvas | `#FFFFFF` |
| Intro / explanatory panel | `#F2F2F2` |
| Secondary CTA | `#F1F1F1` |
| Editorial resources section | `#111111` |
| Resource cards on dark | `#303030` |
| Product preview canvas | Image-specific / neutral |
| Active product accent | `#70F000` |

Keep backgrounds mostly flat. Gradients may appear inside media artwork or campaign previews, but should not become a site-wide UI treatment.

## 12. Responsive behavior

### Breakpoints

| Name | Width |
|---|---:|
| Mobile | `< 640px` |
| Tablet | `640–1023px` |
| Desktop | `1024–1439px` |
| Wide | `≥ 1440px` |

### Mobile rules

- Collapse desktop navigation into a menu button; retain logo and primary account action if space permits.
- Stack hero text above preview.
- Headline: 40–48px, line-height around 1.02.
- Body: 16–17px.
- CTA full-width or fit-content, minimum height 56px.
- Stack split feature sections; use image first or after copy consistently within a page.
- Reduce section padding to 56–72px.
- Cards become one column; maintain readable spacing and touch targets.
- Avoid horizontal overflow from logo strips, wide screenshots, or navigation.

### Tablet rules

- Hero may remain two-column if each side has at least 320px; otherwise stack.
- Use 44–54px hero headings.
- Feature sections can use a 45/55 split.
- Card grids use two columns.

## 13. Accessibility

- Maintain WCAG AA contrast for body text and controls.
- Lime CTA text must remain dark (`#141414`) for legibility.
- All controls need visible keyboard focus.
- Use semantic header, nav, main, section, article, and footer elements.
- Provide descriptive alt text for meaningful images; decorative media uses empty alt text.
- Ensure dropdowns are keyboard accessible and expose expanded state.
- Do not convey selected/error states by color alone.
- Respect reduced-motion preferences; avoid autoplaying audio.

## 14. Motion

- Keep motion subtle and purposeful.
- Hover transitions: 150–220ms ease-out.
- Dropdowns: 160–220ms fade/translate.
- Avoid large entrance animations that delay content.
- Product demo video may autoplay muted only when appropriate; provide pause controls and reduced-motion fallback.

## 15. Suggested CSS custom properties

```css
:root {
  --color-ink: #171717;
  --color-ink-soft: #303030;
  --color-text-secondary: #777777;
  --color-text-muted: #969696;
  --color-surface: #ffffff;
  --color-surface-subtle: #f5f5f5;
  --color-surface-muted: #efefef;
  --color-border: #e5e5e5;
  --color-brand: #70f000;
  --color-brand-hover: #61d900;
  --color-brand-soft: #e9ffd6;
  --color-on-brand: #141414;
  --color-on-dark: #ffffff;

  --font-sans: Inter, "Helvetica Neue", Arial, sans-serif;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 999px;

  --container-max: 1440px;
  --page-gutter: clamp(20px, 7.5vw, 150px);

  --shadow-subtle: 0 1px 2px rgb(0 0 0 / 0.04);
  --transition-fast: 180ms ease-out;
}
```

## 16. Page composition checklist

- [ ] Header aligns with the main content container.
- [ ] Hero communicates one core promise and has one dominant CTA.
- [ ] Trust indicator is compact and does not compete with the headline.
- [ ] Product preview is large, relevant, and clearly framed.
- [ ] Body copy uses gray rather than low-contrast pale text.
- [ ] Lime is reserved for primary actions and active accents.
- [ ] Feature sections alternate media and text to sustain rhythm.
- [ ] Logo strip is visually quiet and responsive.
- [ ] Dark editorial section has clear contrast and consistent card sizing.
- [ ] Mobile layout stacks cleanly without clipping or overflow.
- [ ] Keyboard focus, accessible labels, and reduced-motion behavior are implemented.

## 17. Implementation note

This is a screenshot-derived visual specification, not an official VEED brand guideline. Values such as exact colors, font family, spacing, and breakpoints are approximations inferred from the supplied images. For production, sample colors from original assets and verify brand typography, logo usage, accessibility contrast, and responsive behavior against the live product.

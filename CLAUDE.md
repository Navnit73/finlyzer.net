# Finlyzers Project Guidelines

@AGENTS.md

## Design System & Color Variables Rule

Whenever creating or modifying any new component, page, or layout:
- **ALWAYS use the CSS variable colors defined in `src/app/globals.css`** (e.g. `var(--color-brand)`, `var(--color-ink)`, `var(--color-surface)`, `var(--color-border)`, etc.) or their Tailwind `@theme` aliases (`bg-brand`, `text-ink`, `bg-surface-subtle`, `text-text-secondary`, etc.).
- Never hardcode arbitrary hex colors.
- Follow the VEED-inspired financial tool hub specifications in `design.md`.

## New Feature Pages Rule (Guest Marketing vs Signed-In App)

Every new user-facing feature (converter, reconciliation, etc.) gets two separate surfaces. Follow the bank reconciliation feature as the reference implementation.

1. **Public SEO pages (guests only)** — e.g. `/convert/[slug]`, `/reconcile/[slug]`
   - Content lives in markdown under `src/content/<feature>/`, loaded via `src/lib/seo-markdown.ts`, rendered by one `[slug]` template with `generateStaticParams` and `dynamicParams = false`.
   - One search intent per URL; check the keyword ownership before adding a page so pages don't cannibalize each other. No unverifiable claims; tie limits/retention copy to code constants (`FREE_PAGE_LIMIT`, `GUEST_MAX_PAGES`, retention constants).
   - Add the prefix to `PUBLIC_ONLY_PREFIXES` in `src/lib/routes.ts` and to the `src/proxy.ts` matcher, so signed-in users never see marketing pages.
   - Add each page to `public/sitemap.xml`, the Footer and (if top-level) the guest Header nav.

2. **Signed-in app page** — e.g. `/workspace`, `/reconciliations`
   - Only the tool itself (upload/actions) plus a vault/list of the user's past results. No marketing sections.
   - Add the prefix to `APP_PREFIXES` in `src/lib/routes.ts` and the proxy matcher; map the public prefix to it in `appRedirectFor()` so signed-in users opening a public page land here.
   - Add a `layout.tsx` with `PRIVATE_PAGE_METADATA` (noindex), a link in `AdminSidebar`, and point the `AuthModal` post-login destination for the feature at this page.

3. **Shared pieces**
   - Put the upload/tool card in its own component used by both the public hero and the app page (e.g. `ReconciliationUploader`), not inline in the hero.
   - Result pages (e.g. `/document/[id]`, `/reconciliation/[id]`) are shared, noindex, and link back to the app page for signed-in users and to the public page for guests.

4. **Page limits & payment (enforce on the server, never trust the client)**
   - Guests: free up to `FREE_PAGE_LIMIT` (10) pages; 11–`GUEST_MAX_PAGES` (30) pages need the one-time guest unlock (Razorpay order linked to the item so the webhook can fulfil it); above 30 pages require sign-in.
   - Signed-in users: pages come from their credits (`getUserQuota` / `incrementUserPageCount`).
   - Locked guest results show a limited preview and block downloads with 402 in the API, not just in the UI.

## MongoDB Collection Naming Rule (Shared Database)

This site and the OCR / reconciliation backend (`ocr.advance`) use the **same MongoDB database** (`MONGODB_DB_NAME`, default `finlyzer`).
- Collections the backend owns: `jobs`, `documents`, `extractions`, `users`, `reconciliations`, `webhook_deliveries`. `extractions` and `users` are intentionally shared with this site (same `id` / `email` keys); never create site-only data in any of these.
- Every new site-only collection must use the `site_` prefix (e.g. `site_reconciliations`) so it can never collide with a backend collection or its unique indexes.
- Before adding a collection, check the backend's `app/db/mongodb.py` and repositories for the name.

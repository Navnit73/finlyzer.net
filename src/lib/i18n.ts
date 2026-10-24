/**
 * Locales and cross-language page pairs. Pure data (no fs, no Node APIs), so client components
 * such as the German header's language switch can import it.
 *
 * The English site lives at the root ("/", "/convert/...") and the German section under "/de".
 * They are separate sites with separate root layouts (src/app/(site) and src/app/de), so most
 * pages have no counterpart in the other language and carry no cross-language hreflang.
 */

export type Locale = 'en' | 'de';

/** The x-default for every pair: the English page. */
export const DEFAULT_LOCALE: Locale = 'en';

export const GERMAN_ROOT = '/de';

/** Open Graph locale per site. */
export const OG_LOCALE: Record<Locale, string> = { en: 'en_US', de: 'de_DE' };

/**
 * English path → German path for pages that answer the same search intent in both languages.
 * Deliberately empty: /de is run as a separate site with no links to or from the English pages.
 * Adding a pair makes pageMetadata() and /de/sitemap.xml emit reciprocal hreflang on both pages.
 */
export const HREFLANG_PAIRS: Record<string, string> = {};

const GERMAN_TO_ENGLISH: Record<string, string> = Object.fromEntries(
  Object.entries(HREFLANG_PAIRS).map(([en, de]) => [de, en]),
);

export function germanPathFor(englishPath: string): string | null {
  return HREFLANG_PAIRS[englishPath] ?? null;
}

export function englishPathFor(germanPath: string): string | null {
  return GERMAN_TO_ENGLISH[germanPath] ?? null;
}

/**
 * Site-relative hreflang map for a page, or null when the page should carry none.
 * English pages without a German counterpart get none (the English site is global English).
 * German pages always declare themselves as "de"; paired ones add "en" and "x-default".
 */
export function hreflangPaths(path: string, locale: Locale): Record<string, string> | null {
  const en = locale === 'en' ? path : englishPathFor(path);
  const de = locale === 'de' ? path : germanPathFor(path);
  if (!de) return null;
  return {
    de,
    ...(en ? { en, 'x-default': en } : {}),
  };
}

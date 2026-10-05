import type { Metadata } from 'next';

// Canonical public origin. Deliberately not derived from NEXTAUTH_URL: a build with a local or
// staging auth URL would otherwise ship localhost canonicals and sitemap entries.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://finlyzers.com').replace(/\/$/, '');
export const SITE_NAME = 'Finlyzer';

// English-speaking markets served by the same content (no locale-prefixed routes).
const HREFLANG_LOCALES = ['en-US', 'en-GB', 'en-IN', 'en-CA', 'en-AU'] as const;

export function absoluteUrl(path: string = '/'): string {
  if (path === '/' || path === '') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function getLanguageAlternates(path: string): NonNullable<Metadata['alternates']> {
  const url = absoluteUrl(path);
  const languages: Record<string, string> = { 'x-default': url };
  for (const locale of HREFLANG_LOCALES) languages[locale] = url;
  return { canonical: url, languages };
}

export function getBreadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

import type { Metadata } from 'next';
import { OG_LOCALE, hreflangPaths, type Locale } from '@/lib/i18n';

// Canonical public origin. Deliberately not derived from NEXTAUTH_URL: a build with a local or
// staging auth URL would otherwise ship localhost canonicals.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://finlyzers.com').replace(/\/$/, '');
export const SITE_NAME = 'Finlyzers';

/** Stable JSON-LD node ids, so pages can reference the site-wide entities without repeating them. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
/** The standalone German section (/de) is its own WebSite entity, defined on /de. */
export const GERMAN_WEBSITE_ID = `${SITE_URL}/de#website`;
export const WEBAPP_ID = `${SITE_URL}/#webapp`;

export function absoluteUrl(path: string = '/'): string {
  if (path === '/' || path === '') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Default share card (same artwork as src/app/opengraph-image.jpg). 1200x675 JPEG, about 100 KB, so every platform shows it. */
const DEFAULT_SHARE_IMAGE = {
  url: '/og_image.jpg',
  width: 1200,
  height: 675,
  alt: 'Finlyzers bank statement converter: PDF to Excel, CSV and QuickBooks',
  type: 'image/jpeg',
};

/*
 * International SEO: the root is one global English site (html lang="en", no locale prefix) and
 * /de is a separate German section (html lang="de", src/app/de). Every page has a self-referencing
 * canonical. hreflang comes from src/lib/i18n.ts: German pages declare "de", and pages listed in
 * HREFLANG_PAIRS link to each other with "en", "de" and x-default (English). English pages without
 * a German counterpart carry no hreflang.
 */

interface PageMetadataInput {
  /** Full <title>, brand included. Bypasses the root "%s | Finlyzers" template. */
  title: string;
  description: string;
  /** Site-relative path of the canonical URL, e.g. "/convert/bank-statement-to-csv". */
  path: string;
  /** Shorter title for social cards; defaults to `title`. */
  socialTitle?: string;
  /** Set false when the route segment has its own opengraph-image / twitter-image file. */
  defaultShareImage?: boolean;
  /** Language of the page; German pages live under /de. */
  locale?: Locale;
}

/**
 * Canonical, Open Graph and Twitter tags for an indexable page, built from one title/description
 * pair so they can't drift apart. A page's own openGraph object stops the root opengraph-image.jpg
 * from being inherited, so the default card is set explicitly; segments with their own
 * opengraph-image / twitter-image file (e.g. /convert/[slug]) must pass defaultShareImage: false,
 * because config images take precedence over the segment's generated image.
 */
export function pageMetadata({ title, description, path, socialTitle = title, defaultShareImage = true, locale = 'en' }: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const hreflang = hreflangPaths(path, locale);
  const languages = hreflang
    ? Object.fromEntries(Object.entries(hreflang).map(([lang, p]) => [lang, absoluteUrl(p)]))
    : undefined;
  const shareImage = locale === 'de' ? { ...DEFAULT_SHARE_IMAGE, alt: 'Finlyzers auf Deutsch' } : DEFAULT_SHARE_IMAGE;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[locale],
      ...(hreflang?.en && hreflang.de ? { alternateLocale: [OG_LOCALE[locale === 'en' ? 'de' : 'en']] } : {}),
      siteName: SITE_NAME,
      url,
      title: socialTitle,
      description,
      ...(defaultShareImage ? { images: [shareImage] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      ...(defaultShareImage ? { images: [shareImage.url] } : {}),
    },
  };
}

/** Metadata for signed-in / private app pages. */
export const PRIVATE_PAGE_METADATA: Metadata = {
  robots: { index: false, follow: false },
};

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

/** WebPage node tied to the site-wide WebSite entity. */
export function getWebPageJsonLd({
  path,
  name,
  description,
  dateModified,
  locale = 'en',
}: {
  path: string;
  name: string;
  description: string;
  dateModified?: string;
  locale?: Locale;
}) {
  const url = absoluteUrl(path);
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: locale,
    isPartOf: { '@id': locale === 'de' ? GERMAN_WEBSITE_ID : WEBSITE_ID },
    ...(dateModified ? { dateModified } : {}),
  };
}

/**
 * Publisher of German pages, inlined with its name: the Organization entity is only defined on the
 * English homepage, and /de doesn't link there, so a bare @id would leave Article author unnamed.
 */
export const GERMAN_PUBLISHER = { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/de'), logo: absoluteUrl('/logo.png') };

/** FAQPage node. Only use for questions rendered visibly on the same page. */
export function getFaqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** Serializes JSON-LD for a <script> tag, escaping "<" so content can't close the tag early. */
export function serializeJsonLd(graph: Record<string, unknown>[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
}

import type { Metadata } from 'next';

// Canonical public origin. Deliberately not derived from NEXTAUTH_URL: a build with a local or
// staging auth URL would otherwise ship localhost canonicals.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://finlyzers.com').replace(/\/$/, '');
export const SITE_NAME = 'Finlyzers';

/** Stable JSON-LD node ids, so pages can reference the site-wide entities without repeating them. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;
export const WEBAPP_ID = `${SITE_URL}/#webapp`;

export function absoluteUrl(path: string = '/'): string {
  if (path === '/' || path === '') return SITE_URL;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Default share card (same artwork as src/app/opengraph-image.png). PNG for the widest crawler support. */
const DEFAULT_SHARE_IMAGE = {
  url: '/og_image.png',
  width: 1672,
  height: 941,
  alt: 'Finlyzers bank statement converter: PDF to Excel, CSV and QuickBooks',
  type: 'image/png',
};

/*
 * International SEO: the site is one global English site (html lang="en", no locale prefixes),
 * so pages carry a self-referencing canonical and no hreflang. Add hreflang only when a genuinely
 * localized page exists (e.g. /uk/...), pointing each locale at its own URL plus x-default.
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
}

/**
 * Canonical, Open Graph and Twitter tags for an indexable page, built from one title/description
 * pair so they can't drift apart. A page's own openGraph object stops the root opengraph-image.png
 * from being inherited, so the default card is set explicitly; segments with their own
 * opengraph-image / twitter-image file (e.g. /convert/[slug]) must pass defaultShareImage: false,
 * because config images take precedence over the segment's generated image.
 */
export function pageMetadata({ title, description, path, socialTitle = title, defaultShareImage = true }: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: SITE_NAME,
      url,
      title: socialTitle,
      description,
      ...(defaultShareImage ? { images: [DEFAULT_SHARE_IMAGE] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      ...(defaultShareImage ? { images: [DEFAULT_SHARE_IMAGE.url] } : {}),
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
export function getWebPageJsonLd({ path, name, description, dateModified }: { path: string; name: string; description: string; dateModified?: string }) {
  const url = absoluteUrl(path);
  return {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: 'en',
    isPartOf: { '@id': WEBSITE_ID },
    ...(dateModified ? { dateModified } : {}),
  };
}

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

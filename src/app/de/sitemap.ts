import type { MetadataRoute } from 'next';
import { GERMAN_ROOT } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/seo-config';
import { DE_TRUST_PAGES } from '@/lib/trust-pages';
import { getAllRatgeberSlugs } from '@/lib/ratgeber-markdown';

/**
 * /de/sitemap.xml (the English sitemap, public/sitemap.xml, is maintained by hand).
 * Lists all German routes dynamically, including all Ratgeber articles from src/content/ratgeber/*.md.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const ratgeberSlugs = getAllRatgeberSlugs();
  const ratgeberPaths = ratgeberSlugs.map((slug) => `/de/ratgeber/${slug}`);

  const allPaths = [
    GERMAN_ROOT,
    '/de/konverter/e-rechnung',
    '/de/ratgeber',
    ...ratgeberPaths,
    ...DE_TRUST_PAGES.map((p) => p.path),
  ];

  return allPaths.map((path) => ({ url: absoluteUrl(path) }));
}

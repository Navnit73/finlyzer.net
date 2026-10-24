import type { MetadataRoute } from 'next';
import { GERMAN_ROOT } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/seo-config';
import { DE_TRUST_PAGES } from '@/lib/trust-pages';

/**
 * /de/sitemap.xml (the English sitemap, public/sitemap.xml, is maintained by hand). No lastmod, as in
 * the English sitemap. List new /de pages here as they ship.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [GERMAN_ROOT, ...DE_TRUST_PAGES.map((p) => p.path)].map((path) => ({ url: absoluteUrl(path) }));
}

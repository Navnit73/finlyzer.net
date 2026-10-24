import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo-config';
import { DE_TRUST_PAGES } from '@/lib/trust-pages';

/**
 * /de/sitemap.xml (the English sitemap, public/sitemap.xml, is maintained by hand). No lastmod, as in
 * the English sitemap. The /de home page is left out while it is noindex (see src/app/de/page.tsx);
 * list it again, with new /de pages, once it has real content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return DE_TRUST_PAGES.map((p) => ({ url: absoluteUrl(p.path) }));
}

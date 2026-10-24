import type { MetadataRoute } from 'next';
import { GERMAN_ROOT } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/seo-config';

/**
 * /de/sitemap.xml (the English sitemap, public/sitemap.xml, is maintained by hand).
 * The German section currently has only its home page; list new /de pages here as they ship.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absoluteUrl(GERMAN_ROOT) }];
}

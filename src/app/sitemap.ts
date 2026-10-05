import { MetadataRoute } from 'next';
import { getAllLandingPages } from '@/lib/seo-markdown';
import { SITE_URL } from '@/lib/seo-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = getAllLandingPages();
  const contentUpdated = pages.reduce(
    (latest, page) => (page.lastModified > latest ? page.lastModified : latest),
    new Date(0)
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: contentUpdated,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/convert`,
      lastModified: contentUpdated,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/pricing`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  const programmaticRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${SITE_URL}/convert/${page.slug}`,
    lastModified: page.lastModified,
    changeFrequency: 'monthly',
    priority: page.category === 'formats' ? 0.9 : 0.85,
  }));

  return [...staticRoutes, ...programmaticRoutes];
}

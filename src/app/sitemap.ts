import { MetadataRoute } from 'next';
import { getAllLandingPages } from '@/lib/seo-markdown';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://finlyzer.net';
  const pages = getAllLandingPages();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/convert`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  const programmaticRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${baseUrl}/convert/${page.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  return [...staticRoutes, ...programmaticRoutes];
}

import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // No trailing slashes: '/dashboard/' would not block '/dashboard' itself. '/document' also covers '/documents'.
        // Pages here also send noindex; CSS, JS (/_next/) and images stay crawlable.
        disallow: ['/api/', '/admin', '/superadmin', '/dashboard', '/workspace', '/invoices', '/document', '/user'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

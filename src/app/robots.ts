import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // No trailing slashes: '/dashboard/' would not block '/dashboard' itself. '/document' also covers '/documents'.
        disallow: ['/api/', '/admin', '/superadmin', '/dashboard', '/invoices', '/document', '/user'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // No trailing slashes: '/dashboard/' would not block '/dashboard' itself. '/document' also covers '/documents'; '/analysis' is the noindex analyzer result page.
        // Pages here also send noindex; CSS, JS (/_next/) and images stay crawlable.
        disallow: ['/api/', '/admin', '/superadmin', '/dashboard', '/workspace', '/invoices', '/document', '/analysis', '/user'],
      },
    ],
    // public/sitemap.xml lists the English site; the German section generates its own (src/app/de/sitemap.ts).
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/de/sitemap.xml`],
  };
}

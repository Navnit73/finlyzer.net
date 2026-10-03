import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/superadmin/', '/dashboard/', '/invoices/'],
      },
    ],
    sitemap: 'https://finlyzer.net/sitemap.xml',
  };
}

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
    sitemap: `${process.env.NEXTAUTH_URL || 'https://finlyzers.com'}/sitemap.xml`,
  };
}

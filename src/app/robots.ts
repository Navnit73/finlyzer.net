import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo-config';

// No trailing slashes: '/dashboard/' would not block '/dashboard' itself. '/document' also covers '/documents'; '/analysis' is the noindex analyzer result page.
// Pages here also send noindex; CSS, JS (/_next/) and images stay crawlable.
const PRIVATE_PATHS = [
  '/api/',
  '/admin',
  '/superadmin',
  '/dashboard',
  '/workspace',
  '/invoices',
  '/document',
  '/analysis',
  '/user',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Auto-generated social-card images (convert/reconcile/calculators/analyzer [slug] routes) aren't
        // real pages - Google was crawling and flagging them as "Crawled - currently not indexed" noise.
        disallow: [...PRIVATE_PATHS, '/*/opengraph-image', '/*/twitter-image'],
      },
      {
        // Link-preview bots that obey robots.txt must fetch those card images, or shared links show no image.
        // A named group replaces the '*' group for that bot, so the private paths are repeated here.
        userAgent: ['Twitterbot', 'LinkedInBot', 'facebookexternalhit', 'Slackbot', 'Discordbot'],
        allow: '/',
        disallow: PRIVATE_PATHS,
      },
    ],
    // public/sitemap.xml lists the English site; the German section generates its own (src/app/de/sitemap.ts).
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/de/sitemap.xml`],
  };
}

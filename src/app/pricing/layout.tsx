import type { Metadata } from 'next';
import { SITE_NAME, absoluteUrl } from '@/lib/seo-config';

const title = 'Bank Statement Converter Pricing: Pay Per Page | Finlyzers';
const description =
  'Simple pay-as-you-go pricing for converting bank statements to Excel, CSV, QBO, and OFX. Free up to 10 pages, no subscription, pay only for what you convert.';

// The pricing page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: absoluteUrl('/pricing') },
  openGraph: {
    title,
    description,
    url: absoluteUrl('/pricing'),
    siteName: SITE_NAME,
    type: 'website',
    images: [{ url: '/og_image.webp', width: 1200, height: 630, alt: 'Finlyzers pricing', type: 'image/webp' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og_image.webp'],
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

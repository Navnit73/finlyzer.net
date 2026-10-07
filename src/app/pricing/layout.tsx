import { pageMetadata } from '@/lib/seo-config';

// The pricing page is a client component, so its metadata lives here.
export const metadata = pageMetadata({
  title: 'Bank Statement Converter Pricing: Pay Per Page | Finlyzers',
  description:
    'Simple pay-as-you-go pricing for converting bank statements to Excel, CSV, QBO, and OFX. Free up to 10 pages, no subscription, pay only for what you convert.',
  path: '/pricing',
});

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

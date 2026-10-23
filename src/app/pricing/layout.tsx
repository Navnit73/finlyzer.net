import {
  WEBAPP_ID,
  getBreadcrumbJsonLd,
  getFaqJsonLd,
  getWebPageJsonLd,
  pageMetadata,
  serializeJsonLd,
} from '@/lib/seo-config';
import { FREE_PAGE_LIMIT, PRICING_PLANS } from '@/types/pricing';
import { PRICING_FAQS } from './faqs';

const title = 'Bank Statement Converter Pricing: Pay Per Page | Finlyzers';
const description =
  'Simple pay-as-you-go pricing for converting bank statements to Excel, CSV, QBO, and OFX. Free up to 10 pages, no subscription, pay only for what you convert.';

// The pricing page is a client component, so its metadata lives here.
export const metadata = pageMetadata({ title, description, path: '/pricing' });

// WebPage with the plans as an OfferCatalog, plus the FAQs rendered on the page.
const jsonLd = serializeJsonLd([
  {
    ...getWebPageJsonLd({ path: '/pricing', name: title, description }),
    about: { '@id': WEBAPP_ID },
    mainEntity: {
      '@type': 'OfferCatalog',
      name: 'Finlyzers pricing',
      itemListElement: [
        {
          '@type': 'Offer',
          name: 'Free',
          price: '0',
          priceCurrency: 'USD',
          description: `Statements up to ${FREE_PAGE_LIMIT} pages`,
        },
        ...PRICING_PLANS.map((plan) => ({
          '@type': 'Offer',
          name: plan.name,
          price: String(plan.price_usd),
          priceCurrency: 'USD',
          description: plan.description,
        })),
      ],
    },
  },
  getBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Pricing', path: '/pricing' },
  ]),
  getFaqJsonLd(PRICING_FAQS),
]);

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {children}
    </>
  );
}

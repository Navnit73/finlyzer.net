import { FREE_PAGE_LIMIT } from '@/types/pricing';

/** Shown on the pricing page and emitted as FAQPage JSON-LD by the layout, so the two can't drift apart. */
export const PRICING_FAQS = [
  {
    q: 'Is it really free for small statements?',
    a: `Yes. Any statement up to ${FREE_PAGE_LIMIT} pages converts and downloads for free in every format, with no card required.`,
  },
  {
    q: 'What does the $10 Document Pass cover?',
    a: 'One statement between 11 and 30 pages: full conversion plus download in all 6 export formats. Pay once, no subscription.',
  },
  {
    q: 'Do purchased page credits expire?',
    a: 'No. Purchased page credits are permanent and never expire.',
  },
  {
    q: 'What happens if a document fails to parse?',
    a: 'If a document fails validation or OCR extraction, no page credits are deducted from your balance.',
  },
];

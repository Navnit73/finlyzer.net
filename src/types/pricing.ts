export interface PricingPlan {
  id: 'guest_doc_unlock' | 'single_10' | 'pack_25' | 'pack_50' | 'pack_100';
  name: string;
  price_usd: number;
  price_inr?: number;
  pages: number;
  description: string;
  features: string[];
  badge?: string;
  popular?: boolean;
}

export interface OrderRecord {
  _id?: string;
  order_id: string;
  user_email: string;
  plan_id: 'guest_doc_unlock' | 'single_10' | 'pack_25' | 'pack_50' | 'pack_100';
  plan_name: string;
  amount_usd: number;
  amount_inr?: number;
  pages_credited: number;
  status: 'created' | 'pending' | 'completed' | 'failed';
  payment_gateway: 'razorpay';
  document_id?: string;
  guest_session_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  /** Name of the payer as reported by Razorpay (cardholder name), shown on the receipt. */
  payer_name?: string;
  payer_email?: string;
  payer_contact?: string;
  /** How they paid, e.g. 'Visa card ending 1111', 'UPI (name@bank)', 'Netbanking (HDFC)'. */
  payment_method_label?: string;
  /** Currency and amount (minor units) actually charged on the Razorpay order. */
  currency?: string;
  amount_minor?: number;
  created_at: string;
  updated_at: string;
}

// Free tier: documents up to FREE_PAGE_LIMIT pages convert and download at no cost.
export const FREE_PAGE_LIMIT = 10;

// 'single_10' is retired (merged into the $10 Document Pass) but stays in the id unions above
// so historical orders still type-check and render.
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'guest_doc_unlock',
    name: 'Document Pass',
    price_usd: 10,
    price_inr: 830,
    pages: 30,
    description: 'One-time $10 unlock for a single statement of 11 to 30 pages.',
    features: [
      'Convert & download one 11–30 page statement',
      'All 6 export formats (.xlsx, .csv, .pdf, .qbo, .ofx, .qif)',
      'AI reconciled ledger & cash flow metrics',
      'Encrypted PDF support',
    ],
  },
  {
    id: 'pack_25',
    name: 'Starter 600',
    price_usd: 25,
    pages: 600,
    description: 'Ideal for small businesses and accountants processing monthly statements.',
    features: [
      'Bulk / batch multi-file upload',
      '12-month consolidated annual master P&L',
      'Permanent cloud document sync',
      'High-speed OCR processing',
    ],
    popular: true,
    badge: 'MOST POPULAR',
  },
  {
    id: 'pack_50',
    name: 'Pro 1000',
    price_usd: 50,
    pages: 1000,
    description: 'High-volume reconciliation for financial analysts and tax consultants.',
    features: [
      'Up to 50 files in a single batch upload',
      'Unlimited cloud history storage',
      'QuickBooks (.qbo) & Xero (.ofx) sync',
      'Multi-currency balance auditing',
    ],
  },
  {
    id: 'pack_100',
    name: 'Enterprise 5000',
    price_usd: 100,
    pages: 5000,
    description: 'Maximum scale package for auditing firms and corporate finance teams.',
    features: [
      'Lowest per-page cost',
      'Dedicated high-speed queue',
      'Priority AI reconciliation & entity extraction',
      'Bulk export to master Excel workbooks',
    ],
    badge: 'BEST VALUE',
  },
];

export interface PricingPlan {
  id: 'single_10' | 'pack_25' | 'pack_50' | 'pack_100';
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
  plan_id: 'single_10' | 'pack_25' | 'pack_50' | 'pack_100';
  plan_name: string;
  amount_usd: number;
  amount_inr?: number;
  pages_credited: number;
  status: 'created' | 'pending' | 'completed' | 'failed';
  payment_gateway: 'razorpay' | 'manual' | 'test' | 'stripe';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  created_at: string;
  updated_at: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'single_10',
    name: 'Single Download',
    price_usd: 10,
    pages: 1,
    description: 'Instant 1-document quick conversion pass with all export formats.',
    features: [
      '1 Full Document Extraction ($10/doc)',
      'All 6 Export Formats (.xlsx, .csv, .pdf, .qbo, .ofx, .qif)',
      'DeepSeek AI Reconciliation',
      'Encrypted PDF Support',
    ],
  },
  {
    id: 'pack_25',
    name: 'Starter 600',
    price_usd: 25,
    pages: 600,
    description: 'Ideal for small businesses and accountants processing monthly statements.',
    features: [
      '600 Page Credits ($0.041/page)',
      'Bulk / Batch Multi-File Upload',
      '12-Month Consolidated Annual Master P&L',
      'Permanent MongoDB Cloud Sync',
      'Priority PyMuPDF Processing',
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
      '1,000 Page Credits ($0.050/page)',
      'Up to 50 Files in Single Batch Upload',
      'Unlimited Cloud History Storage',
      'QuickBooks (.qbo) & Xero (.ofx) Sync',
      'Multi-Currency Balance Auditing',
    ],
  },
  {
    id: 'pack_100',
    name: 'Enterprise 5000',
    price_usd: 100,
    pages: 5000,
    description: 'Maximum scale package for auditing firms and corporate finance teams.',
    features: [
      '5,000 Page Credits ($0.020/page)',
      'Lowest Per-Page Cost',
      'Dedicated High-Speed Queue',
      'Priority AI Reconciliation & Entity Extraction',
      'Bulk Data Export to Master Excel Workbooks',
    ],
    badge: 'BEST VALUE',
  },
];

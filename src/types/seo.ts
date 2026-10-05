export interface SEOSampleRow {
  date: string;
  desc: string;
  amount: string;
  type: 'Debit' | 'Credit' | string;
  balance: string;
}

export interface SEOFeature {
  title: string;
  description: string;
}

export interface SEOFAQ {
  question: string;
  answer: string;
}

export interface SEOStep {
  title: string;
  body: string;
}

export interface SEOConverterPage {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: 'formats' | 'us-banks' | 'uk-banks' | 'india-banks' | 'tools';
  bankName: string;
  /** Singular noun used in headings, e.g. "Chase Bank Statement" or "Financial PDF". */
  statementLabel: string;
  outputFormat: string;
  country: string;
  badgeText: string;
  keywords: string[];
  features: SEOFeature[];
  tableColumns: string[];
  sampleData: SEOSampleRow[];
  /** Optional page-specific "How it works" copy; falls back to the template steps when empty. */
  steps: SEOStep[];
  faqs: SEOFAQ[];
  contentHtml?: string;
  rawContent: string;
}

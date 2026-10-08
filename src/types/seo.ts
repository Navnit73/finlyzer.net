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
  /** Visible lead paragraph under the H1; falls back to metaDescription. */
  intro: string;
  /** Primary + secondary search terms this page owns (keyword map; not emitted as a meta tag). */
  keywords: string[];
  /** Slugs of converter pages to cross-link, in display order. */
  related: string[];
  features: SEOFeature[];
  tableColumns: string[];
  sampleData: SEOSampleRow[];
  /** Optional page-specific "How it works" copy; falls back to the template steps when empty. */
  steps: SEOStep[];
  faqs: SEOFAQ[];
  /** The upload hero also takes CSV / Excel files (spreadsheet-to-QBO converters). */
  acceptsSpreadsheets: boolean;
  contentHtml?: string;
  rawContent: string;
}

/** Long-form how-to page under /guides, rendered from src/content/guides. */
export interface SEOGuidePage {
  slug: string;
  /** Visible H1. */
  title: string;
  /** Short name for breadcrumbs and link cards. */
  shortTitle: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  badgeText: string;
  /** Label for the upload hero button. */
  ctaLabel: string;
  datePublished: string;
  dateModified: string;
  /** The upload hero also takes CSV / Excel files. */
  acceptsSpreadsheets: boolean;
  /** Converter slugs to cross-link, in display order. */
  related: string[];
  keywords: string[];
  faqs: SEOFAQ[];
  contentHtml: string;
}

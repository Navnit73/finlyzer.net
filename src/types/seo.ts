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
  category: 'formats' | 'us-banks' | 'uk-banks' | 'eu-banks' | 'au-banks' | 'india-banks' | 'tools';
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
  /** YYYY-MM-DD of the last material content change; shown on the page and in WebPage JSON-LD. */
  dateModified: string;
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

/** A /reconcile feature; `icon` is a key of reconciliationFeatureIcons. */
export interface SEOReconFeature extends SEOFeature {
  icon?: string;
}

/** One illustrative bank-vs-ledger pair for the sample comparison table on reconciliation pages. */
export interface SEOReconSampleRow {
  date: string;
  bankDesc: string;
  bankAmount: string;
  ledgerDesc: string;
  ledgerAmount: string;
  result: string;
}

/** Bank reconciliation landing page under /reconcile, rendered from src/content/reconciliation. */
export interface SEOReconciliationPage {
  slug: string;
  /** Visible H1. */
  title: string;
  /** Short name for breadcrumbs, footer and link cards. */
  shortTitle: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  badgeText: string;
  /** Primary + secondary search terms this page owns (keyword map; not emitted as a meta tag). */
  keywords: string[];
  /** Slugs of other reconciliation pages to cross-link, in display order. */
  related: string[];
  benefits: string[];
  features: SEOReconFeature[];
  steps: SEOStep[];
  sampleRows: SEOReconSampleRow[];
  faqs: SEOFAQ[];
  /** Renders the interactive bank reconciliation statement calculator under the hero. */
  showCalculator: boolean;
  dateModified: string;
  contentHtml: string;
}

/** Analyzer landing page under /analyzer, rendered from src/content/analyzers. */
export interface SEOAnalyzerPage {
  slug: string;
  /** Visible H1. */
  title: string;
  /** Short name for breadcrumbs, footer and link cards. */
  shortTitle: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  badgeText: string;
  /** Primary + secondary search terms this page owns (keyword map; not emitted as a meta tag). */
  keywords: string[];
  highlights: SEOStep[];
  steps: SEOStep[];
  faqs: SEOFAQ[];
  dateModified: string;
  contentHtml: string;
}

/** Free calculator page under /calculators, rendered from src/content/calculators. */
export interface SEOCalculatorPage {
  slug: string;
  /** Visible H1. */
  title: string;
  /** Short name for breadcrumbs, footer and link cards. */
  shortTitle: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  badgeText: string;
  /** Primary + secondary search terms this page owns (keyword map; not emitted as a meta tag). */
  keywords: string[];
  benefits: string[];
  faqs: SEOFAQ[];
  datePublished: string;
  dateModified: string;
  contentHtml: string;
  /** Hub section: personal or business finance. */
  category: 'personal' | 'business';
  /** Short chips on the share image (2–4 words each). */
  ogTags: string[];
  /** Hub sub-group, e.g. "Loans and credit". */
  group: string;
  /** Market the page is written for: "Global", "India", "United States"… */
  market: string;
  /** One line for hub and related-tool cards. */
  summary: string;
  /** Hero primary button text (scrolls to the calculator). */
  ctaLabel: string;
  /** Optional hero secondary button. */
  secondaryHref: string;
  secondaryLabel: string;
  faqSubtitle: string;
  /** Calculator slugs shown under "Related tools", in order. */
  related: string[];
  /** Related non-calculator pages (analyzer, converters, reconcile). */
  relatedLinks: SEOCalculatorLink[];
  /** Official or primary sources for rates and rules quoted on the page. */
  sources: SEOSource[];
  /** Date the rates/rules on the page were last checked against `sources` (tax pages). */
  lastVerified: string;
  /** Optional closing CTA band; omitted when finalCtaHref is empty. */
  finalCtaTitle: string;
  finalCtaBody: string;
  finalCtaHref: string;
  finalCtaLabel: string;
}

export interface SEOCalculatorLink {
  href: string;
  label: string;
  body: string;
}

export interface SEOSource {
  label: string;
  url: string;
}

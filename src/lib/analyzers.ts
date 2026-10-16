import type { DocumentType } from '@/types/ocr';

/**
 * Client-safe registry of analyzers served at /analyzer/[slug].
 * Page copy (meta, intro, FAQs, long-form content) lives in src/content/analyzers/<slug>.md.
 * To add an analyzer: add an entry here, add its markdown file, and render its report in
 * /analysis/[id] (picked by `kind`).
 */
export interface AnalyzerDefinition {
  slug: string;
  kind: 'bank_statement';
  title: string;
  /** Document type sent to the OCR service. */
  documentType: DocumentType;
}

export const ANALYZERS: AnalyzerDefinition[] = [
  {
    slug: 'bank-statement-analyzer',
    kind: 'bank_statement',
    title: 'Bank Statement Analyzer',
    documentType: 'bank_statement',
  },
];

export function getAnalyzer(slug: string): AnalyzerDefinition | undefined {
  return ANALYZERS.find((a) => a.slug === slug);
}

export function analyzerPath(slug: string): string {
  return `/analyzer/${slug}`;
}

import { SEOFAQ } from '@/types/seo';

export interface RatgeberTocItem {
  id: string;
  text: string;
  level: number;
}

export interface RatgeberMainCta {
  title?: string;
  label: string;
  href: string;
  description?: string;
}

export interface SEORatgeberPage {
  slug: string;
  /** Visible H1 */
  title: string;
  /** Short title for breadcrumbs and link cards */
  shortTitle: string;
  /** Meta title for <head> */
  metaTitle: string;
  /** Meta description */
  metaDescription: string;
  /** Lead paragraph under H1 */
  intro: string;
  badgeText: string;
  datePublished: string;
  dateModified: string;
  readingTime: string;
  author: string;
  mainCta: RatgeberMainCta;
  keywords: string[];
  related: string[];
  faqs: SEOFAQ[];
  toc: RatgeberTocItem[];
  contentHtml: string;
  rawContent: string;
}

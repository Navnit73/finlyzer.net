import type { Metadata } from 'next';
import { PRIVATE_PAGE_METADATA } from '@/lib/seo-config';

// Private results page (client component): keep it out of search results.
export const metadata: Metadata = { ...PRIVATE_PAGE_METADATA, title: 'Reconciliation Report' };

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}

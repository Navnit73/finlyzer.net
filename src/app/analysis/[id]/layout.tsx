import type { Metadata } from 'next';
import { PRIVATE_PAGE_METADATA } from '@/lib/seo-config';

// Private result page (client component): keep it out of search results.
export const metadata: Metadata = { ...PRIVATE_PAGE_METADATA, title: 'Statement Analysis' };

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}

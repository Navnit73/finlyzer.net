import type { Metadata } from 'next';
import { PRIVATE_PAGE_METADATA } from '@/lib/seo-config';

// Private app page (client component): keep it out of search results.
export const metadata: Metadata = { ...PRIVATE_PAGE_METADATA, title: 'Dashboard' };

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return children;
}

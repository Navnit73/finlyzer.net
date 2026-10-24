import type { Metadata } from 'next';
import DeNotFound from '@/components/de/DeNotFound';

// Shown when a /de page calls notFound(). Unmatched /de URLs get the same content from
// src/app/global-not-found.tsx instead.
export const metadata: Metadata = {
  title: 'Seite nicht gefunden',
  // null drops the layout's "index, follow"; Next.js adds its own noindex tag to 404 pages.
  robots: null,
};

export default DeNotFound;

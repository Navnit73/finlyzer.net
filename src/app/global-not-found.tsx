import type { Metadata } from 'next';
import { headers } from 'next/headers';
import SiteLayout, { metadata as siteMetadata } from './(site)/layout';
import NotFound from './(site)/not-found';
import GermanLayout, { metadata as germanMetadata } from './de/layout';
import DeNotFound from '@/components/de/DeNotFound';
import { LOCALE_HEADER } from '@/lib/i18n';

// The English site and /de have separate root layouts, so URLs that match no route at all land
// here (next.config.ts experimental.globalNotFound). src/proxy.ts tags /de requests with
// LOCALE_HEADER, so unmatched /de URLs get the German shell and 404; everything else the English one.
// (A /de/[...rest] catch-all calling notFound() would only send Next's bare error shell, with the
// German page drawn client-side.)
async function isGerman() {
  return (await headers()).get(LOCALE_HEADER) === 'de';
}

export async function generateMetadata(): Promise<Metadata> {
  // Bypasses layouts, so repeat each site's defaults the layout would have provided.
  // Next.js adds its own noindex tag to 404 responses.
  if (await isGerman()) {
    return { ...germanMetadata, title: 'Seite nicht gefunden | Finlyzers', robots: null };
  }
  return { ...siteMetadata, title: 'Page Not Found | Finlyzers', robots: null };
}

export default async function GlobalNotFound() {
  if (await isGerman()) {
    return (
      <GermanLayout>
        <DeNotFound />
      </GermanLayout>
    );
  }
  return (
    <SiteLayout>
      <NotFound />
    </SiteLayout>
  );
}

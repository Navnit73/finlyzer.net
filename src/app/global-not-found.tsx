import type { Metadata } from 'next';
import SiteLayout, { metadata as siteMetadata } from './(site)/layout';
import NotFound from './(site)/not-found';

// The English site and /de have separate root layouts, so URLs that match no route at all land
// here (next.config.ts experimental.globalNotFound). It reuses the English shell and 404 page;
// unknown /de/... pages get the German 404 from src/app/de/not-found.tsx instead.
export const metadata: Metadata = {
  // Bypasses layouts, so repeat the English site defaults the old app/not-found.tsx inherited.
  ...siteMetadata,
  title: 'Page Not Found | Finlyzers',
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <SiteLayout>
      <NotFound />
    </SiteLayout>
  );
}

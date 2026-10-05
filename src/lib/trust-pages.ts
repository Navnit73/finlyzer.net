/** Trust & legal pages. Shared by the footer, sitemap and each page's "Related" links. */
export interface TrustPage {
  path: string;
  title: string;
  shortTitle: string;
}

export const TRUST_PAGES: TrustPage[] = [
  { path: '/security', title: 'Security & Data Handling', shortTitle: 'Security' },
  { path: '/privacy-policy', title: 'Privacy Policy', shortTitle: 'Privacy' },
  { path: '/terms', title: 'Terms & Conditions', shortTitle: 'Terms' },
  { path: '/disclaimer', title: 'Disclaimer', shortTitle: 'Disclaimer' },
  { path: '/editorial-policy', title: 'Editorial Policy & Methodology', shortTitle: 'Methodology' },
  { path: '/faq', title: 'Frequently Asked Questions', shortTitle: 'FAQ' },
];

/** Date the policy text was last revised. Bump whenever a policy page changes materially. */
export const POLICIES_LAST_UPDATED = '2026-10-05';

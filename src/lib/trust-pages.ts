/** Trust & legal pages. Shared by the footer and each page's "Related" links. */
export interface TrustPage {
  path: string;
  title: string;
  shortTitle: string;
}

export const TRUST_PAGES: TrustPage[] = [
  { path: '/about', title: 'About Us & Contact', shortTitle: 'About Us' },
  { path: '/security', title: 'Security & Data Handling', shortTitle: 'Security' },
  { path: '/privacy-policy', title: 'Privacy Policy', shortTitle: 'Privacy' },
  { path: '/terms', title: 'Terms & Conditions', shortTitle: 'Terms' },
  { path: '/disclaimer', title: 'Disclaimer', shortTitle: 'Disclaimer' },
  { path: '/editorial-policy', title: 'Editorial Policy & Methodology', shortTitle: 'Methodology' },
  { path: '/faq', title: 'Frequently Asked Questions', shortTitle: 'FAQ' },
];

/** Date the policy text was last revised. Bump whenever a policy page changes materially. */
export const POLICIES_LAST_UPDATED = '2026-10-09';

/** Trust & legal pages of the German section (/de). Shared by DeFooter, the German sitemap and "Weitere Seiten". */
export const DE_TRUST_PAGES: TrustPage[] = [
  { path: '/de/ueber-uns', title: 'Über uns', shortTitle: 'Über uns' },
  { path: '/de/kontakt', title: 'Kontakt', shortTitle: 'Kontakt' },
  { path: '/de/faq', title: 'Häufige Fragen', shortTitle: 'FAQ' },
  { path: '/de/impressum', title: 'Impressum', shortTitle: 'Impressum' },
  { path: '/de/datenschutz', title: 'Datenschutzerklärung', shortTitle: 'Datenschutz' },
  { path: '/de/nutzungsbedingungen', title: 'Nutzungsbedingungen', shortTitle: 'Nutzungsbedingungen' },
];

/** Date the German legal texts were last revised. Bump whenever one of them changes materially. */
export const DE_POLICIES_LAST_UPDATED = '2026-10-24';

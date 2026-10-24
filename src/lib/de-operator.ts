/**
 * Operator details shown on the German legal and contact pages (Impressum, Datenschutz, Kontakt,
 * FAQ, footer). Same facts as the English About page (src/app/(site)/about/page.tsx); keep both in sync.
 */
export const OPERATOR = {
  /** Proprietor of the sole proprietorship that runs Finlyzers. */
  name: 'NAVNIT RAI',
  brand: 'Finlyzers',
  email: 'navnitrai5389@gmail.com',
  phone: '+91 7355087072',
  phoneHref: 'tel:+917355087072',
  country: 'Indien',
  hours: 'Montag bis Samstag, 9:00–18:00 Uhr indischer Zeit (IST, UTC+5:30)',
  /**
   * Postal address lines for the Impressum (§ 5 DDG requires a full postal address) and the
   * Datenschutzerklärung. The country is rendered separately from `country`.
   */
  postalAddress: ['Post Khadda', 'Kushinagar, Uttar Pradesh 274802'],
};

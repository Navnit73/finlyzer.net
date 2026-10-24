import type { Metadata } from 'next';
import { GERMAN_ROOT } from '@/lib/i18n';
import { GERMAN_PUBLISHER, GERMAN_WEBSITE_ID, SITE_NAME, absoluteUrl, getWebPageJsonLd, pageMetadata, serializeJsonLd } from '@/lib/seo-config';

const title = 'Finlyzers auf Deutsch | Finanzen für Selbstständige';
const description =
  'Finlyzers auf Deutsch: Hier entstehen Rechner und Ratgeber zu Steuern, Liquidität und Buchhaltung für Selbstständige und kleine Unternehmen.';

export const metadata: Metadata = pageMetadata({ title, description, path: GERMAN_ROOT, locale: 'de' });

export default function GermanHomePage() {
  // The German WebSite entity lives here; every /de page points to it via isPartOf.
  const jsonLd = serializeJsonLd([
    {
      '@type': 'WebSite',
      '@id': GERMAN_WEBSITE_ID,
      url: absoluteUrl(GERMAN_ROOT),
      name: SITE_NAME,
      inLanguage: 'de',
      publisher: GERMAN_PUBLISHER,
    },
    getWebPageJsonLd({ path: GERMAN_ROOT, name: 'Finlyzers auf Deutsch', description, locale: 'de' }),
  ]);

  return (
    <div className="w-full -mb-6 sm:-mb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <section
        aria-labelledby="hero-title"
        className="-mt-6 sm:-mt-10 pt-14 sm:pt-24 pb-14 sm:pb-20 text-center bg-[var(--color-surface-subtle)] shadow-[0_0_0_100vmax_var(--color-surface-subtle)] [clip-path:inset(0_-100vmax)]"
      >
        <h1 id="hero-title" className="type-hero !text-[clamp(2.25rem,7vw,4rem)] max-w-4xl mx-auto text-balance">
          Finanzen für Selbstständige, verständlich erklärt
        </h1>
        <p className="type-lead mt-5 max-w-2xl mx-auto">
          Hier entstehen kostenlose Rechner und Ratgeber zu Steuern, Liquidität und Buchhaltung für Selbstständige und kleine
          Unternehmen.
        </p>
      </section>
    </div>
  );
}

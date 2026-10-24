import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { OPERATOR } from '@/lib/de-operator';
import { GERMAN_PUBLISHER, pageMetadata } from '@/lib/seo-config';

const path = '/de/kontakt';
const title = 'Kontakt';
const description = `So erreichen Sie Finlyzers: per E-Mail an ${OPERATOR.email} oder telefonisch und per WhatsApp unter ${OPERATOR.phone}.`;

export const metadata: Metadata = pageMetadata({ title: `${title} | Finlyzers`, description, path, locale: 'de' });

const sections: LegalSection[] = [
  {
    id: 'kontaktwege',
    heading: 'So erreichen Sie uns',
    body: (
      <div className="not-prose !mt-6 grid grid-cols-1 sm:grid-cols-2 border-y border-[var(--color-border)] divide-y sm:divide-y-0 sm:divide-x divide-[var(--color-border)]">
        <div className="py-5 sm:pr-6 space-y-2">
          <p className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
            <Mail className="w-4 h-4" aria-hidden="true" />
            E-Mail
          </p>
          <a href={`mailto:${OPERATOR.email}`} className="block text-[17px] font-medium break-all">
            {OPERATOR.email}
          </a>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Für Fragen, Hinweise auf Fehler, Datenschutzanfragen und alle anderen Anliegen.
          </p>
        </div>

        <div className="py-5 sm:pl-6 space-y-2">
          <p className="flex items-center gap-2 text-[13px] text-[var(--color-text-muted)]">
            <Phone className="w-4 h-4" aria-hidden="true" />
            Telefon / WhatsApp
          </p>
          <a href={OPERATOR.phoneHref} className="block text-[17px] font-medium tabular-nums">
            {OPERATOR.phone}
          </a>
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{OPERATOR.hours}.</p>
        </div>
      </div>
    ),
  },
  {
    id: 'sprache',
    heading: 'Sprache und Erreichbarkeit',
    body: (
      <p>
        Wir sitzen in {OPERATOR.country}. Bitte beachten Sie die Zeitverschiebung: Unsere Geschäftszeiten ({OPERATOR.hours})
        entsprechen in Deutschland 4:30–13:30 Uhr (Winterzeit) bzw. 5:30–14:30 Uhr (Sommerzeit). Sie können uns auf
        Deutsch oder Englisch schreiben; per E-Mail erreichen Sie uns am zuverlässigsten.
      </p>
    ),
  },
  {
    id: 'fehler-melden',
    heading: 'Fehler melden',
    body: (
      <p>
        Wenn Ihnen auf unseren Seiten ein inhaltlicher Fehler auffällt, schreiben Sie uns bitte mit der Adresse der Seite und
        einer kurzen Beschreibung. Wir prüfen jeden Hinweis und korrigieren die Seite, wenn er zutrifft.
      </p>
    ),
  },
  {
    id: 'datenschutz',
    heading: 'Datenschutz',
    body: (
      <p>
        Wie wir Ihre Angaben bei einer Kontaktaufnahme verarbeiten, erklären wir in der{' '}
        <Link href="/de/datenschutz#kontaktaufnahme">Datenschutzerklärung</Link>.
      </p>
    ),
  },
];

export default function KontaktPage() {
  return (
    <LegalPage
      locale="de"
      path={path}
      title={title}
      description={description}
      intro={<p>Sie haben eine Frage, einen Hinweis oder ein Anliegen zum Datenschutz? Schreiben Sie uns oder rufen Sie an.</p>}
      sections={sections}
      jsonLd={[
        {
          ...GERMAN_PUBLISHER,
          email: OPERATOR.email,
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: OPERATOR.email,
            telephone: OPERATOR.phone.replace(/\s/g, ''),
            availableLanguage: ['de', 'en'],
          },
        },
      ]}
    />
  );
}

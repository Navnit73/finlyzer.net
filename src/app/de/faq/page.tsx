import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { OPERATOR } from '@/lib/de-operator';
import { getFaqJsonLd, pageMetadata } from '@/lib/seo-config';

const path = '/de/faq';
const title = 'Häufige Fragen';
const description =
  'Antworten zu Finlyzers auf Deutsch: Wer dahintersteht, was es kostet, ob es Steuerberatung ist, welche Daten verarbeitet werden und wie Sie uns erreichen.';

export const metadata: Metadata = pageMetadata({ title: 'FAQ: Häufige Fragen | Finlyzers', description, path, locale: 'de' });

interface Faq {
  q: string;
  /** Plain text used for FAQPage structured data. */
  a: string;
  /** Optional rich version with links, shown on the page. */
  rich?: React.ReactNode;
}

const groups: { id: string; heading: string; faqs: Faq[] }[] = [
  {
    id: 'angebot',
    heading: 'Über das Angebot',
    faqs: [
      {
        q: 'Was ist Finlyzers auf Deutsch?',
        a: 'Der deutschsprachige Bereich von Finlyzers. Hier entstehen kostenlose Rechner und Ratgeber zu Steuern, Liquidität und Buchhaltung für Selbstständige und kleine Unternehmen.',
      },
      {
        q: 'Was kostet die Nutzung?',
        a: 'Nichts. Die deutschsprachigen Inhalte sind kostenlos und ohne Registrierung nutzbar.',
      },
      {
        q: 'Ersetzen die Inhalte eine Steuerberatung?',
        a: 'Nein. Unsere Inhalte sind allgemeine Informationen und keine Steuer-, Rechts- oder Finanzberatung. Für Ihren Einzelfall wenden Sie sich bitte an eine Steuerberaterin oder einen Steuerberater.',
        rich: (
          <>
            Nein. Unsere Inhalte sind allgemeine Informationen und keine Steuer-, Rechts- oder Finanzberatung. Für Ihren Einzelfall
            wenden Sie sich bitte an eine Steuerberaterin oder einen Steuerberater. Mehr dazu in den{' '}
            <Link href="/de/nutzungsbedingungen#keine-beratung">Nutzungsbedingungen</Link>.
          </>
        ),
      },
      {
        q: 'Wer steht hinter Finlyzers?',
        a: `Finlyzers wird von ${OPERATOR.name} als Einzelunternehmen mit Sitz in ${OPERATOR.country} betrieben.`,
        rich: (
          <>
            Finlyzers wird von {OPERATOR.name} als Einzelunternehmen mit Sitz in {OPERATOR.country} betrieben. Mehr erfahren Sie
            unter <Link href="/de/ueber-uns">Über uns</Link> und im <Link href="/de/impressum">Impressum</Link>.
          </>
        ),
      },
    ],
  },
  {
    id: 'datenschutz',
    heading: 'Datenschutz',
    faqs: [
      {
        q: 'Setzt Finlyzers Cookies oder Tracking ein?',
        a: 'Nein. Auf den deutschsprachigen Seiten setzen wir keine Cookies und keine Analyse-, Tracking- oder Werbedienste ein.',
      },
      {
        q: 'Welche Daten werden beim Besuch verarbeitet?',
        a: 'Nur die Daten, die Ihr Browser technisch bedingt überträgt, etwa IP-Adresse, Zeitpunkt und aufgerufene Seite. Sie werden für die Auslieferung und Sicherheit der Website genutzt.',
        rich: (
          <>
            Nur die Daten, die Ihr Browser technisch bedingt überträgt, etwa IP-Adresse, Zeitpunkt und aufgerufene Seite. Sie
            werden für die Auslieferung und Sicherheit der Website genutzt. Details stehen in der{' '}
            <Link href="/de/datenschutz">Datenschutzerklärung</Link>.
          </>
        ),
      },
    ],
  },
  {
    id: 'kontakt',
    heading: 'Kontakt',
    faqs: [
      {
        q: 'Wie erreiche ich Finlyzers?',
        a: `Per E-Mail an ${OPERATOR.email} oder telefonisch und per WhatsApp unter ${OPERATOR.phone}.`,
        rich: (
          <>
            Per E-Mail an <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a> oder telefonisch und per WhatsApp unter{' '}
            <a href={OPERATOR.phoneHref}>{OPERATOR.phone}</a>. Geschäftszeiten und weitere Hinweise finden Sie auf der Seite{' '}
            <Link href="/de/kontakt">Kontakt</Link>.
          </>
        ),
      },
      {
        q: 'Ich habe einen Fehler gefunden. Was kann ich tun?',
        a: `Schreiben Sie uns bitte an ${OPERATOR.email} mit der Adresse der Seite und einer kurzen Beschreibung. Wir prüfen jeden Hinweis und korrigieren die Seite, wenn er zutrifft.`,
      },
    ],
  },
];

export default function DeFaqPage() {
  const sections: LegalSection[] = groups.map((g) => ({
    id: g.id,
    heading: g.heading,
    body: (
      <div className="border-t border-[var(--color-border)]">
        {g.faqs.map((f) => (
          <details key={f.q} className="group border-b border-[var(--color-border)] [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex items-center gap-3 min-h-[56px] py-4 cursor-pointer list-none text-[17px] font-medium text-[var(--color-ink)]">
              <span className="flex-1">{f.q}</span>
              <ChevronDown
                className="w-4 h-4 text-[var(--color-text-muted)] transition-transform group-open:rotate-180 shrink-0"
                aria-hidden="true"
              />
            </summary>
            <p className="pb-5 pr-8">{f.rich ?? f.a}</p>
          </details>
        ))}
      </div>
    ),
  }));

  return (
    <LegalPage
      locale="de"
      path={path}
      title={title}
      description={description}
      intro={<p>Kurze Antworten zum Angebot, zum Datenschutz und dazu, wie Sie uns erreichen.</p>}
      sections={sections}
      jsonLd={[getFaqJsonLd(groups.flatMap((g) => g.faqs))]}
    />
  );
}

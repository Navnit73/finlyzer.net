import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { OPERATOR } from '@/lib/de-operator';
import { pageMetadata } from '@/lib/seo-config';

const path = '/de/nutzungsbedingungen';
const title = 'Nutzungsbedingungen';
const description =
  'Nutzungsbedingungen von Finlyzers auf Deutsch: kostenlose Informationen, keine Steuer- oder Rechtsberatung, Haftung, externe Links und Urheberrecht.';

export const metadata: Metadata = pageMetadata({ title: `${title} | Finlyzers`, description, path, locale: 'de' });

const sections: LegalSection[] = [
  {
    id: 'geltungsbereich',
    heading: '1. Geltungsbereich',
    body: (
      <p>
        Diese Bedingungen gelten für die Nutzung der deutschsprachigen Seiten von Finlyzers unter finlyzers.com/de, betrieben
        von {OPERATOR.name} (siehe <Link href="/de/impressum">Impressum</Link>). Mit der Nutzung der Seiten erkennen Sie diese
        Bedingungen an.
      </p>
    ),
  },
  {
    id: 'angebot',
    heading: '2. Unser Angebot',
    body: (
      <ul>
        <li>Die deutschsprachigen Inhalte sind kostenlos und ohne Registrierung nutzbar.</li>
        <li>Es besteht kein Anspruch darauf, dass die Seiten jederzeit und ohne Unterbrechung verfügbar sind.</li>
        <li>Wir können Inhalte jederzeit ändern, ergänzen oder entfernen.</li>
      </ul>
    ),
  },
  {
    id: 'keine-beratung',
    heading: '3. Keine Steuer- oder Rechtsberatung',
    body: (
      <>
        <p>
          Unsere Inhalte sind allgemeine Informationen. Sie stellen keine Steuer-, Rechts- oder Finanzberatung dar und ersetzen
          keine individuelle Beratung durch eine Steuerberaterin, einen Steuerberater oder eine andere befugte Stelle.
        </p>
        <p>
          Steuerliche Regeln ändern sich und hängen vom Einzelfall ab. Prüfen Sie Ergebnisse und Angaben deshalb, bevor Sie sich
          bei steuerlichen, buchhalterischen oder finanziellen Entscheidungen darauf stützen.
        </p>
      </>
    ),
  },
  {
    id: 'haftung',
    heading: '4. Haftung',
    body: (
      <>
        <p>
          Wir erstellen unsere Inhalte mit Sorgfalt, übernehmen aber keine Gewähr dafür, dass sie vollständig, richtig und
          aktuell sind.
        </p>
        <p>
          Da unser Angebot unentgeltlich ist, haften wir nur für Vorsatz und grobe Fahrlässigkeit. Unberührt bleibt die Haftung
          für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit sowie die Haftung nach dem
          Produkthaftungsgesetz.
        </p>
      </>
    ),
  },
  {
    id: 'links',
    heading: '5. Externe Links',
    body: (
      <p>
        Unsere Seiten können Links zu Websites Dritter enthalten. Für deren Inhalte sind ausschließlich die jeweiligen Anbieter
        verantwortlich. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar. Werden uns Rechtsverletzungen
        bekannt, entfernen wir den betreffenden Link umgehend.
      </p>
    ),
  },
  {
    id: 'urheberrecht',
    heading: '6. Urheberrecht',
    body: (
      <p>
        Texte, Grafiken und Gestaltung dieser Seiten sind urheberrechtlich geschützt. Sie dürfen die Inhalte für private Zwecke
        nutzen und auf sie verlinken. Jede darüber hinausgehende Vervielfältigung oder Veröffentlichung bedarf unserer
        vorherigen Zustimmung.
      </p>
    ),
  },
  {
    id: 'datenschutz',
    heading: '7. Datenschutz',
    body: (
      <p>
        Wie wir mit personenbezogenen Daten umgehen, erklären wir in der <Link href="/de/datenschutz">Datenschutzerklärung</Link>.
      </p>
    ),
  },
  {
    id: 'aenderungen',
    heading: '8. Änderungen und Verbraucherschutz',
    body: (
      <p>
        Wir können diese Bedingungen für die Zukunft ändern; maßgeblich ist die jeweils hier veröffentlichte Fassung.
        Zwingende Verbraucherschutzvorschriften des Staates, in dem Sie Ihren gewöhnlichen Aufenthalt haben, bleiben unberührt.
      </p>
    ),
  },
];

export default function NutzungsbedingungenPage() {
  return (
    <LegalPage
      locale="de"
      path={path}
      title={title}
      description={description}
      intro={<p>Die Regeln für die Nutzung der deutschsprachigen Seiten von Finlyzers.</p>}
      sections={sections}
    />
  );
}

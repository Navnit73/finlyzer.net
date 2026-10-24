import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { OPERATOR } from '@/lib/de-operator';
import { pageMetadata } from '@/lib/seo-config';

const path = '/de/ueber-uns';
const title = 'Über uns';
const description = `Wer hinter Finlyzers steht, was wir auf Deutsch anbieten und nach welchen Grundsätzen unsere Inhalte entstehen. Betrieben von ${OPERATOR.name}.`;

export const metadata: Metadata = pageMetadata({ title: `${title} | Finlyzers`, description, path, locale: 'de' });

const sections: LegalSection[] = [
  {
    id: 'wer-wir-sind',
    heading: 'Wer wir sind',
    body: (
      <>
        <p>
          Finlyzers ist ein Einzelunternehmen von <strong>{OPERATOR.name}</strong> mit Sitz in {OPERATOR.country}. Wir
          entwickeln Software für Finanzdokumente, darunter die Umwandlung von Kontoauszügen in Tabellen und den Abgleich von
          Bankumsätzen mit der Buchhaltung.
        </p>
        <table>
          <tbody>
            <tr>
              <td>Inhaber</td>
              <td>
                <strong>{OPERATOR.name}</strong>
              </td>
            </tr>
            <tr>
              <td>Rechtsform</td>
              <td>Einzelunternehmen</td>
            </tr>
            <tr>
              <td>Sitz</td>
              <td>{OPERATOR.country}</td>
            </tr>
            <tr>
              <td>E-Mail</td>
              <td>
                <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    id: 'angebot',
    heading: 'Was wir auf Deutsch anbieten',
    body: (
      <p>
        Im deutschsprachigen Bereich entstehen kostenlose Rechner und Ratgeber zu Steuern, Liquidität und Buchhaltung für
        Selbstständige und kleine Unternehmen. Sie können alle Inhalte ohne Registrierung nutzen.
      </p>
    ),
  },
  {
    id: 'grundsaetze',
    heading: 'Wie unsere Inhalte entstehen',
    body: (
      <ul>
        <li>
          <strong>Allgemeine Information statt Beratung:</strong> Unsere Inhalte erklären Regeln und Rechenwege allgemein. Sie
          ersetzen keine Steuerberatung für Ihren Einzelfall.
        </li>
        <li>
          <strong>Nachvollziehbare Rechenwege:</strong> Unsere Rechner sollen zeigen, wie ein Ergebnis zustande kommt, damit
          Sie es prüfen können.
        </li>
        <li>
          <strong>Keine unbelegten Versprechen:</strong> Wir veröffentlichen keine Nutzerzahlen, Bewertungen oder Statistiken, die
          wir nicht belegen können.
        </li>
        <li>
          <strong>Korrekturen:</strong> Hinweise auf Fehler prüfen wir und korrigieren die betroffene Seite, wenn sie zutreffen.
        </li>
      </ul>
    ),
  },
  {
    id: 'datenschutz',
    heading: 'Datenschutz',
    body: (
      <p>
        Auf den deutschsprachigen Seiten setzen wir keine Cookies und kein Tracking ein. Details finden Sie in der{' '}
        <Link href="/de/datenschutz">Datenschutzerklärung</Link>.
      </p>
    ),
  },
  {
    id: 'kontakt',
    heading: 'Kontakt',
    body: (
      <p>
        Fragen, Hinweise oder Kritik? Schreiben Sie uns an <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a> oder
        nutzen Sie die weiteren Wege auf der Seite <Link href="/de/kontakt">Kontakt</Link>.
      </p>
    ),
  },
];

export default function UeberUnsPage() {
  return (
    <LegalPage
      locale="de"
      path={path}
      title={title}
      description={description}
      intro={
        <p>
          Finlyzers wird von <strong>{OPERATOR.name}</strong> betrieben. Auf Deutsch erklären wir Finanzthemen für Selbstständige
          und kleine Unternehmen verständlich und kostenlos.
        </p>
      }
      sections={sections}
    />
  );
}

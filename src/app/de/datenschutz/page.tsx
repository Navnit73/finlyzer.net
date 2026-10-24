import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { OPERATOR } from '@/lib/de-operator';
import { pageMetadata } from '@/lib/seo-config';

const path = '/de/datenschutz';
const title = 'Datenschutzerklärung';
const description =
  'Welche Daten beim Besuch von Finlyzers auf Deutsch verarbeitet werden: Server-Logfiles, Kontaktanfragen, keine Cookies, kein Tracking, Ihre Rechte nach der DSGVO.';

export const metadata: Metadata = pageMetadata({ title: `${title} | Finlyzers`, description, path, locale: 'de' });

// Describes only the /de section: no sign-in, no forms, no cookies and no analytics (the German
// layout loads no Clarity script and next/font serves Inter from this site, not from Google).
// Update this page before adding any of those to /de.
const sections: LegalSection[] = [
  {
    id: 'verantwortlicher',
    heading: '1. Verantwortlicher',
    body: (
      <>
        <p>Verantwortlich für die Datenverarbeitung auf diesen Seiten im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:</p>
        <p>
          {OPERATOR.name} ({OPERATOR.brand})
          {OPERATOR.postalAddress.map((line) => (
            <span key={line}>
              <br />
              {line}
            </span>
          ))}
          <br />
          {OPERATOR.country}
          <br />
          E-Mail: <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
          <br />
          Telefon: <a href={OPERATOR.phoneHref}>{OPERATOR.phone}</a>
        </p>
        <p>
          Weitere Angaben finden Sie im <Link href="/de/impressum">Impressum</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'ueberblick',
    heading: '2. Das Wichtigste in Kürze',
    body: (
      <ul>
        <li>Für die Nutzung der deutschsprachigen Seiten brauchen Sie kein Konto und müssen keine Daten eingeben.</li>
        <li>Wir setzen auf diesen Seiten keine Cookies und keine Analyse-, Tracking- oder Werbedienste ein.</li>
        <li>Schriftarten werden von unserem eigenen Server geladen; es werden keine Daten an Google Fonts übertragen.</li>
        <li>Wir verkaufen keine personenbezogenen Daten.</li>
      </ul>
    ),
  },
  {
    id: 'server-logfiles',
    heading: '3. Bereitstellung der Website und Server-Logfiles',
    body: (
      <>
        <p>
          Beim Aufruf einer Seite überträgt Ihr Browser technisch bedingt Daten an unseren Server. Dabei können folgende Daten
          verarbeitet werden:
        </p>
        <ul>
          <li>IP-Adresse des anfragenden Geräts</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>aufgerufene Adresse (URL) und übertragene Datenmenge</li>
          <li>Statuscode der Antwort, Referrer-URL sowie Browsertyp und Betriebssystem</li>
        </ul>
        <p>
          Die Verarbeitung ist erforderlich, um die Website auszuliefern und ihre Sicherheit und Stabilität zu gewährleisten,
          etwa zur Abwehr von Angriffen. Rechtsgrundlage ist unser berechtigtes Interesse nach Art. 6 Abs. 1 lit. f DSGVO.
          Die Daten werden nicht mit anderen Datenquellen zusammengeführt und gelöscht, sobald sie für diese Zwecke nicht mehr
          erforderlich sind.
        </p>
      </>
    ),
  },
  {
    id: 'kontaktaufnahme',
    heading: '4. Kontaktaufnahme per E-Mail oder Telefon',
    body: (
      <>
        <p>
          Wenn Sie uns per E-Mail, Telefon oder WhatsApp kontaktieren, verarbeiten wir Ihre Angaben (zum Beispiel Name,
          E-Mail-Adresse oder Telefonnummer und den Inhalt Ihrer Nachricht), um Ihre Anfrage zu beantworten.
        </p>
        <p>
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage mit einem Vertrag oder vorvertraglichen Maßnahmen
          zusammenhängt, und im Übrigen unser berechtigtes Interesse an der Bearbeitung von Anfragen (Art. 6 Abs. 1 lit. f
          DSGVO). Wir löschen die Daten, wenn Ihre Anfrage abschließend bearbeitet ist und keine gesetzlichen
          Aufbewahrungspflichten entgegenstehen.
        </p>
        <p>
          Bei einer Kontaktaufnahme über WhatsApp gelten zusätzlich die Datenschutzbestimmungen von WhatsApp (Meta). Wenn Sie
          das nicht möchten, schreiben Sie uns bitte eine E-Mail.
        </p>
      </>
    ),
  },
  {
    id: 'drittland',
    heading: '5. Übermittlung in Drittländer',
    body: (
      <p>
        Der Verantwortliche hat seinen Sitz in {OPERATOR.country}. Wenn Sie uns kontaktieren, werden Ihre Angaben deshalb in{' '}
        {OPERATOR.country} verarbeitet. Für {OPERATOR.country} besteht kein Angemessenheitsbeschluss der EU-Kommission, das
        Datenschutzniveau kann also niedriger sein als in der EU. Die Übermittlung erfolgt nur, soweit sie zur Bearbeitung
        Ihrer Anfrage erforderlich ist (Art. 49 Abs. 1 lit. b DSGVO).
      </p>
    ),
  },
  {
    id: 'ihre-rechte',
    heading: '6. Ihre Rechte',
    body: (
      <>
        <p>Sie haben im Rahmen der gesetzlichen Vorgaben jederzeit das Recht auf:</p>
        <ul>
          <li>Auskunft über die zu Ihrer Person gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung (Art. 17 DSGVO) und Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>
            <strong>Widerspruch</strong> gegen eine Verarbeitung, die auf unserem berechtigten Interesse beruht, aus Gründen, die
            sich aus Ihrer besonderen Situation ergeben (Art. 21 DSGVO)
          </li>
        </ul>
        <p>
          Für alle Anliegen genügt eine E-Mail an <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>. Außerdem können
          Sie sich bei einer Datenschutz-Aufsichtsbehörde beschweren, insbesondere in dem Mitgliedstaat Ihres Aufenthaltsorts
          oder Arbeitsplatzes (Art. 77 DSGVO).
        </p>
      </>
    ),
  },
  {
    id: 'pflicht',
    heading: '7. Pflicht zur Bereitstellung und automatisierte Entscheidungen',
    body: (
      <p>
        Sie sind nicht verpflichtet, uns personenbezogene Daten bereitzustellen. Ohne die technisch übertragenen Daten kann die
        Website allerdings nicht ausgeliefert werden. Eine automatisierte Entscheidungsfindung einschließlich Profiling findet
        nicht statt.
      </p>
    ),
  },
  {
    id: 'aenderungen',
    heading: '8. Änderungen dieser Datenschutzerklärung',
    body: (
      <p>
        Wenn sich die Datenverarbeitung auf diesen Seiten ändert, zum Beispiel durch neue Funktionen, passen wir diese
        Erklärung an und aktualisieren das Datum oben auf der Seite.
      </p>
    ),
  },
];

export default function DatenschutzPage() {
  return (
    <LegalPage
      locale="de"
      path={path}
      title={title}
      description={description}
      intro={
        <p>
          Diese Erklärung gilt für die deutschsprachigen Seiten von Finlyzers unter finlyzers.com/de. Sie beschreibt, welche
          personenbezogenen Daten wir verarbeiten, wozu und welche Rechte Sie haben.
        </p>
      }
      sections={sections}
    />
  );
}

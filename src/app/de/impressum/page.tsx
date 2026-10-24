import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { type LegalSection } from '@/components/legal/LegalPage';
import { OPERATOR } from '@/lib/de-operator';
import { pageMetadata } from '@/lib/seo-config';

const path = '/de/impressum';
const title = 'Impressum';
const description = `Impressum von Finlyzers auf Deutsch: Anbieterkennzeichnung nach § 5 DDG, Kontakt und Verantwortlicher für den Inhalt (${OPERATOR.name}).`;

export const metadata: Metadata = pageMetadata({ title: `${title} | Finlyzers`, description, path, locale: 'de' });

function Address() {
  return (
    <p>
      {OPERATOR.name}
      <br />
      {OPERATOR.brand} (Einzelunternehmen)
      {OPERATOR.postalAddress.map((line) => (
        <span key={line}>
          <br />
          {line}
        </span>
      ))}
      <br />
      {OPERATOR.country}
    </p>
  );
}

const sections: LegalSection[] = [
  {
    id: 'anbieter',
    heading: 'Angaben gemäß § 5 DDG',
    body: <Address />,
  },
  {
    id: 'kontakt',
    heading: 'Kontakt',
    body: (
      <table>
        <tbody>
          <tr>
            <td>E-Mail</td>
            <td>
              <a href={`mailto:${OPERATOR.email}`}>{OPERATOR.email}</a>
            </td>
          </tr>
          <tr>
            <td>Telefon</td>
            <td>
              <a href={OPERATOR.phoneHref}>{OPERATOR.phone}</a>
            </td>
          </tr>
        </tbody>
      </table>
    ),
  },
  {
    id: 'verantwortlich',
    heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
    body: <Address />,
  },
  {
    id: 'streitbeilegung',
    heading: 'Verbraucherstreitbeilegung',
    body: (
      <p>
        Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen.
      </p>
    ),
  },
  {
    id: 'haftung',
    heading: 'Haftung und Urheberrecht',
    body: (
      <p>
        Hinweise zur Haftung für Inhalte und Links sowie zum Urheberrecht finden Sie in den{' '}
        <Link href="/de/nutzungsbedingungen">Nutzungsbedingungen</Link>.
      </p>
    ),
  },
];

export default function ImpressumPage() {
  return (
    <LegalPage
      locale="de"
      path={path}
      title={title}
      description={description}
      intro={<p>Anbieterkennzeichnung für die deutschsprachigen Seiten von Finlyzers unter finlyzers.com/de.</p>}
      sections={sections}
    />
  );
}

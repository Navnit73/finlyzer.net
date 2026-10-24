import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle2, FileCheck2, Hammer, Landmark, ShieldCheck, UserRound, type LucideIcon,
} from 'lucide-react';
import { SectionBand, SectionHeading, FaqSection } from '@/components/converter/sections';
import {
  DownloadVisual,
  FieldMappingList,
  FormVisual,
  HeroIllustration,
  InvoicePaper,
  UploadVisual,
  ValidationReport,
  XmlPanel,
  XrechnungFormatVisual,
  ZugferdFormatVisual,
} from '@/components/de/einvoice/Illustrations';
import { GERMAN_ROOT } from '@/lib/i18n';
import {
  GERMAN_PUBLISHER,
  GERMAN_WEBSITE_ID,
  SITE_NAME,
  absoluteUrl,
  getFaqJsonLd,
  getWebPageJsonLd,
  pageMetadata,
  serializeJsonLd,
} from '@/lib/seo-config';

const title = 'PDF in ZUGFeRD & XRechnung umwandeln | Finlyzers Konverter';
const description =
  'Wandeln Sie Ihre Standard-PDF-Rechnungen in Sekunden in rechtskonforme ZUGFeRD und XRechnung Dateien um. Keine neue Software nötig. Jetzt kostenlos testen!';

// noindex while this is a placeholder with no German tools or guides: an indexed page this thin
// risks being judged a soft 404. Remove `robots` and add the page back to src/app/de/sitemap.ts
// once real content ships. `follow` keeps the footer's legal and contact pages crawlable.
export const metadata: Metadata = {
  ...pageMetadata({ title, description, path: GERMAN_ROOT, locale: 'de' }),
  robots: { index: false, follow: true },
};

// The e-invoice converter has no page yet, so CTAs scroll to the steps. Point this at the tool once it exists.
const CONVERTER_HREF = '#so-funktionierts';

const heroFacts = ['EN 16931', 'ZUGFeRD 2.x / Factur-X', 'XRechnung', 'PDF/A-3'];

const deadlines = [
  { date: '1. Januar 2025', title: 'Empfang', body: 'Alle Unternehmen müssen E-Rechnungen empfangen und verarbeiten können.', done: true },
  { date: '1. Januar 2027', title: 'Versand ab 800.000 € Umsatz', body: 'Unternehmen mit mehr als 800.000 € Vorjahresumsatz müssen E-Rechnungen versenden.', done: false },
  { date: '1. Januar 2028', title: 'Versand für alle', body: 'Die Pflicht zum Versand gilt für alle Unternehmen im B2B-Bereich.', done: false },
];

const steps = [
  {
    visual: UploadVisual,
    title: 'Standard-PDF hochladen',
    body: 'Ziehen Sie Ihre fertige Rechnung als PDF in den gesicherten Upload-Bereich. Unser ZUGFeRD Generator liest das Dokument ein und bereitet die Konvertierung vor.',
  },
  {
    visual: FormVisual,
    title: 'Rechnungsdaten ergänzen',
    body: 'Pflichtangaben wie Rechnungsnummer, Nettobetrag, Steuer oder die Leitweg-ID für XRechnung werden strukturiert erfasst. Fehlendes ergänzen Sie in einer übersichtlichen Eingabemaske.',
  },
  {
    visual: DownloadVisual,
    title: 'Validierte E-Rechnung herunterladen',
    body: 'Klicken Sie auf „Generieren“: Das Tool bettet die XML-Datei ein. Laden Sie Ihr ZUGFeRD PDF/A-3 oder Ihre reine XRechnung-XML herunter und versenden Sie sie an Ihren Kunden.',
  },
];

const audiences: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: UserRound,
    title: 'Freiberufler & Kleinunternehmer',
    body: 'Sie schreiben nur wenige Rechnungen im Monat? Ein teures Abo einer großen Buchhaltungssoftware lohnt sich nicht. Bei uns können Sie bedarfsgenau PDF in ZUGFeRD umwandeln – kostenlos in der Testversion – oder günstige Pakete für geringe Volumen nutzen.',
  },
  {
    icon: Landmark,
    title: 'Auftragnehmer der öffentlichen Hand (B2G)',
    body: 'Wenn Sie für Bund, Länder oder Kommunen arbeiten, reichen Sie eine XRechnung über Portale wie die ZRE ein. Mit Finlyzers wandeln Sie Ihre PDF in XRechnung um und stellen sicher, dass Pflichtfelder wie die Leitweg-ID korrekt formatiert sind.',
  },
  {
    icon: Hammer,
    title: 'Handwerksbetriebe und Agenturen',
    body: 'Bleiben Sie bei Ihrem bewährten Rechnungsprogramm. Wir sind die Brücke zwischen Ihrem gewohnten PDF-Format und den neuen gesetzlichen Anforderungen an ZUGFeRD.',
  },
];

const formats = [
  {
    name: 'ZUGFeRD',
    tag: 'Empfohlen für B2B',
    visual: ZugferdFormatVisual,
    body: 'Eine PDF/A-3-Rechnung, die aussieht wie gewohnt, mit eingebetteter XML. Ihr Kunde liest das PDF, seine Software liest die Daten.',
    points: ['Für Menschen und Maschinen lesbar', 'Ideal zwischen Unternehmen', 'Kompatibel mit Factur-X'],
  },
  {
    name: 'XRechnung',
    tag: 'Standard für Behörden',
    visual: XrechnungFormatVisual,
    body: 'Eine reine XML-Datei ohne sichtbare Ansicht, gemacht für die automatische Verarbeitung in öffentlichen Rechnungseingangsportalen.',
    points: ['Reine Strukturdaten', 'Für Bund, Länder und Kommunen', 'Leitweg-ID als Pflichtfeld'],
  },
];

const comparisonRows = [
  ['Dateiformat', 'PDF/A-3 (PDF mit eingebetteter XML)', 'Reine XML-Datei'],
  ['Lesbarkeit für Menschen', 'Ja, sieht aus wie eine ganz normale PDF-Rechnung.', 'Nein, reine Strukturdaten.'],
  ['Strukturierte Daten', 'Ja (XML-Datei ist unsichtbar in der PDF eingebettet).', 'Ja (ausschließlich XML).'],
  ['Empfohlener Einsatzort', 'B2B (zwischen Unternehmen), da beide Seiten profitieren.', 'B2G (Behörden, Bund, Länder, Kommunen).'],
  ['Erstellung mit Finlyzers', 'PDF in ZUGFeRD-Format umwandeln', 'PDF in XML umwandeln (XRechnung)'],
];

const faqs = [
  {
    q: 'Kann ich das Tool testen und eine PDF in ZUGFeRD umwandeln kostenlos?',
    a: 'Ja! Wir bieten eine Freemium-Version an, die als ZUGFeRD Generator kostenlos fungiert. Sie können Ihre ersten Dokumente ohne Risiko konvertieren und die Funktionalität testen. Das ist ideal, wenn Sie eine XRechnung-Freeware oder eine Lösung für gelegentliche Rechnungen suchen.',
  },
  {
    q: 'Was genau ist eine ZUGFeRD Datei?',
    a: 'Eine ZUGFeRD-Datei ist im Grunde eine PDF-Rechnung, die eine zweite, unsichtbare Ebene enthält: eine XML-Datei mit strukturierten Daten (Rechnungsbetrag, Datum, Positionen). Dadurch können Menschen die PDF normal lesen, während die Buchhaltungssoftware die Rechnungsdaten fehlerfrei automatisch aus der ZUGFeRD-PDF einlesen kann.',
  },
  {
    q: 'Kann Finlyzers auch eine PDF in XRechnung konvertieren?',
    a: 'Absolut. Neben ZUGFeRD bieten wir die Möglichkeit, eine reine XRechnung aus PDF erstellen zu lassen. Das ist besonders wichtig, wenn Sie Rechnungen an staatliche Einrichtungen senden müssen: Dort wird in der Regel eine XRechnung als XML-Datei erwartet, nicht eine PDF.',
  },
  {
    q: 'Gibt es ein ZUGFeRD Beispiel PDF zum Download?',
    a: 'Ja. Damit Sie sehen können, wie das Endresultat aussieht, stellen wir Ihnen gerne ein ZUGFeRD Beispiel-PDF sowie ein XML-Rechnungsbeispiel zur Verfügung. Besuchen Sie dazu unsere Ressourcen-Seite für ZUGFeRD-2.x-Beispieldateien.',
  },
  {
    q: 'Was ist der Unterschied zwischen ZUGFeRD 1.0 und 2.0?',
    a: 'ZUGFeRD 1.0 basierte noch auf älteren Standards. ZUGFeRD 2.0 bis zur aktuellen Version 2.3 sind vollständig kompatibel mit der europäischen Norm EN 16931 und der französischen Factur-X. Unser System erzeugt immer die aktuelle Version.',
  },
  {
    q: 'Bieten Sie eine ZUGFeRD API für Entwickler an?',
    a: 'Unser Fokus liegt auf dem bedienungsfreundlichen Web-Interface für Endanwender. Wenn Sie jedoch Entwickler sind und die Umwandlung automatisieren möchten, bieten wir auch eine ZUGFeRD API (sowie eine XRechnung REST API) an. Kontaktieren Sie unseren Support für API-Schlüssel und Dokumentation, um das Generieren von ZUGFeRD-XML zu automatisieren.',
  },
  {
    q: 'Ist eine Registrierung zwingend erforderlich?',
    a: 'Für die ersten kostenlosen Testkonvertierungen können Sie unser Tool als Gast nutzen. Für wiederkehrende Rechnungen, Vorlagen und Rechnungs-Historien empfehlen wir die Anlage eines kostenlosen Accounts.',
  },
];

const ctaClass = 'btn-brand-primary w-full sm:w-auto !min-h-[50px] !px-8 !text-[17px]';

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
    getWebPageJsonLd({ path: GERMAN_ROOT, name: 'PDF in ZUGFeRD & XRechnung umwandeln', description, locale: 'de' }),
    getFaqJsonLd(faqs),
  ]);

  return (
    <div className="w-full -mb-6 sm:-mb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* Hero */}
      <section
        aria-labelledby="hero-title"
        className="-mt-6 sm:-mt-10 pt-12 sm:pt-20 pb-14 sm:pb-20 bg-[var(--color-surface-subtle)] shadow-[0_0_0_100vmax_var(--color-surface-subtle)] [clip-path:inset(0_-100vmax)]"
      >
        <div className="text-center">
          <span className="feature-badge">E-Rechnung für KMU, Freiberufler &amp; B2G</span>
          <h1 id="hero-title" className="type-hero !text-[clamp(2.25rem,6.5vw,4rem)] mt-5 max-w-4xl mx-auto text-balance">
            PDF in ZUGFeRD &amp; XRechnung umwandeln
          </h1>
          <p className="type-lead mt-5 max-w-2xl mx-auto text-balance">
            Ihr Rechnungsprogramm exportiert nur Standard-PDFs? Laden Sie Ihre Rechnung hoch und erhalten Sie eine ZUGFeRD-Datei
            oder XRechnung nach EN 16931 – ohne neue Buchhaltungssoftware.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={CONVERTER_HREF} className={ctaClass}>
              <span>ZUGFeRD Generator kostenlos testen</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
            <Link href="#so-funktionierts" className="btn-brand-secondary w-full sm:w-auto !min-h-[50px] !px-8 !text-[17px]">
              So funktioniert&apos;s
            </Link>
          </div>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[13px] text-[var(--color-text-secondary)]">
            {heroFacts.map((f) => (
              <li key={f} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" /> {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 sm:mt-16">
          <HeroIllustration />
        </div>
      </section>

      {/* Why now + deadlines */}
      <SectionBand>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="type-display">Warum Sie jetzt ein Tool zum Erstellen von ZUGFeRD &amp; XRechnung brauchen</h2>
              <p className="type-body">
                Seit 2025 müssen Unternehmen in Deutschland strukturierte elektronische Rechnungen nach der europäischen Norm EN 16931
                empfangen können. Einfache PDF-Dateien ohne strukturierte XML-Daten gelten nicht als elektronische Rechnung.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="type-headline">Vermeiden Sie teure Software-Upgrades</h3>
              <p className="type-body">
                Anstatt tausende Euro in komplexe ERP-Systeme (wie DATEV oder SAP) zu investieren, schreiben Sie Ihre Rechnung weiter in
                Word, Excel oder Ihrem Rechnungsprogramm und lassen Finlyzers die PDF-Rechnung in ZUGFeRD konvertieren.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="type-headline">ZUGFeRD &amp; XRechnung – alles an einem Ort</h3>
              <p className="type-body">
                Ob B2B oder öffentliche Verwaltung (B2G): Sie wählen flexibel, ob Sie eine ZUGFeRD-Datei erstellen oder die PDF in eine
                XRechnung umwandeln.
              </p>
            </div>
          </div>

          <div className="card-surface p-6 sm:p-8">
            <p className="text-[15px] font-semibold text-[var(--color-ink)]">Fristen der E-Rechnungspflicht im B2B-Bereich</p>
            <ol className="mt-6 relative">
              {deadlines.map((d, i) => (
                <li key={d.date} className="relative pl-9 pb-7 last:pb-0">
                  {i < deadlines.length - 1 && (
                    <span className="absolute left-[9px] top-6 bottom-0 w-px bg-[var(--color-border)]" aria-hidden="true" />
                  )}
                  <span
                    className={`absolute left-0 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                      d.done
                        ? 'bg-[var(--color-success)]'
                        : 'bg-[var(--color-surface)] border-2 border-[var(--color-brand)]'
                    }`}
                    aria-hidden="true"
                  >
                    {d.done && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-on-brand)]" />}
                  </span>
                  <p className="text-[13px] font-medium text-[var(--color-brand-dark)]">{d.date}</p>
                  <p className="mt-0.5 text-[17px] font-semibold text-[var(--color-ink)]">{d.title}</p>
                  <p className="mt-1 text-[15px] text-[var(--color-text-secondary)] leading-relaxed">{d.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </SectionBand>

      {/* Anatomy: what the tool produces */}
      <SectionBand tone="parchment">
        <section className="space-y-10 sm:space-y-14">
          <SectionHeading
            title="Aus Ihrer PDF wird eine maschinenlesbare Rechnung"
            subtitle="Jede Pflichtangabe Ihrer Rechnung wird einem Feld der Norm EN 16931 zugeordnet und als strukturierte XML gespeichert. So sieht das für eine Beispielrechnung aus."
          />
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.75fr)_minmax(0,1.3fr)] gap-6 items-start">
            <div className="space-y-2">
              <p className="text-[13px] font-medium text-[var(--color-text-muted)]">1. Ihre PDF-Rechnung</p>
              <InvoicePaper markers />
            </div>
            <div className="space-y-2">
              <p className="text-[13px] font-medium text-[var(--color-text-muted)]">2. Zuordnung zur Norm</p>
              <FieldMappingList />
            </div>
            <div className="space-y-2 min-w-0">
              <p className="text-[13px] font-medium text-[var(--color-text-muted)]">3. Erzeugte XML (Auszug)</p>
              <XmlPanel />
            </div>
          </div>
        </section>
      </SectionBand>

      {/* How it works */}
      <SectionBand>
        <section id="so-funktionierts" className="scroll-mt-24 space-y-10 sm:space-y-14">
          <SectionHeading
            title="In 3 einfachen Schritten zur E-Rechnung"
            subtitle="Sie brauchen keine technischen Vorkenntnisse. Der gesamte Prozess dauert weniger als 60 Sekunden."
          />
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {steps.map((s, i) => (
              <li key={s.title} className="card-surface p-5 sm:p-6 flex flex-col">
                <s.visual />
                <span className="mt-6 text-[13px] font-medium text-[var(--color-brand-dark)] tabular-nums">Schritt {i + 1}</span>
                <h3 className="type-headline mt-1">{s.title}</h3>
                <p className="mt-2 text-base text-[var(--color-text-secondary)] leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="flex justify-center">
            <Link href={CONVERTER_HREF} className={ctaClass}>
              <span>Jetzt ZUGFeRD-Datei erstellen</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </SectionBand>

      {/* ZUGFeRD vs XRechnung */}
      <SectionBand tone="parchment">
        <section className="space-y-10 sm:space-y-14">
          <SectionHeading
            title="Unterschied XRechnung und ZUGFeRD: Was benötigen Sie?"
            subtitle="Beide Formate basieren auf der europäischen Norm EN 16931, unterscheiden sich jedoch in ihrer Darstellung."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {formats.map((f) => (
              <div key={f.name} className="card-surface p-6 sm:p-8">
                <div className="rounded-xl bg-[var(--color-surface-subtle)]">
                  <f.visual />
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <h3 className="type-title">{f.name}</h3>
                  <span className="feature-badge">{f.tag}</span>
                </div>
                <p className="mt-3 type-body">{f.body}</p>
                <ul className="mt-5 space-y-2">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-[15px] text-[var(--color-ink)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-success)] shrink-0" aria-hidden="true" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="card-surface overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Vergleich von ZUGFeRD und XRechnung</caption>
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th scope="col" className="py-4 px-5 sm:px-6 text-[13px] font-medium text-[var(--color-text-muted)]">Kriterium</th>
                  <th scope="col" className="py-4 px-5 sm:px-6 font-semibold text-[var(--color-ink)]">ZUGFeRD (2.x)</th>
                  <th scope="col" className="py-4 px-5 sm:px-6 font-semibold text-[var(--color-ink)]">XRechnung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {comparisonRows.map(([criterion, zugferd, xrechnung]) => (
                  <tr key={criterion}>
                    <th scope="row" className="py-4 px-5 sm:px-6 font-medium text-[var(--color-ink)]">{criterion}</th>
                    <td className="py-4 px-5 sm:px-6 text-[var(--color-text-secondary)]">{zugferd}</td>
                    <td className="py-4 px-5 sm:px-6 text-[var(--color-text-secondary)]">{xrechnung}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="type-body max-w-3xl mx-auto text-center">
            Zusammenfassend: Für Rechnungen an andere Unternehmen empfehlen wir ZUGFeRD, da Ihr Kunde die Rechnung wie gewohnt lesen
            kann, während die Buchhaltungssoftware die XML-Daten ausliest. Für Behörden ist die XRechnung der Standard. Unser Tool
            beherrscht beides.
          </p>
        </section>
      </SectionBand>

      {/* Audiences */}
      <SectionBand>
        <section className="space-y-10 sm:space-y-14">
          <SectionHeading
            title="Für wen ist unser E-Rechnung Konverter geeignet?"
            subtitle="Für Unternehmen, die eine unkomplizierte, schnelle Lösung suchen, ohne tief in die IT-Infrastruktur einzugreifen."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {audiences.map((a) => (
              <div key={a.title}>
                <span className="w-12 h-12 rounded-2xl bg-[var(--color-brand-soft)] flex items-center justify-center">
                  <a.icon className="w-6 h-6 text-[var(--color-brand-dark)]" aria-hidden="true" />
                </span>
                <h3 className="type-headline mt-5">{a.title}</h3>
                <p className="mt-2 text-base text-[var(--color-text-secondary)] leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </section>
      </SectionBand>

      {/* Validation */}
      <SectionBand tone="parchment">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="type-display">Technische Sicherheit &amp; ZUGFeRD-Validierung</h2>
              <p className="type-body">
                Eine elektronische Rechnung muss technisch einwandfrei sein. Eine fehlerhafte Struktur kann zur Ablehnung durch Ihren
                Kunden führen.
              </p>
            </div>
            <div className="flex gap-4">
              <span className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
              </span>
              <div>
                <h3 className="type-headline">Strikte EN 16931 &amp; PDF/A-3 Konformität</h3>
                <p className="mt-2 type-body">
                  Wenn Sie eine ZUGFeRD-PDF erstellen, wandelt das System Ihre Datei in das langzeitarchivierbare Format PDF/A-3 um und
                  integriert die ZUGFeRD-XML-Struktur.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="w-10 h-10 rounded-xl bg-[var(--color-brand-soft)] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[var(--color-brand-dark)]" aria-hidden="true" />
              </span>
              <div>
                <h3 className="type-headline">Integrierte ZUGFeRD-Validierung</h3>
                <p className="mt-2 type-body">
                  Vor dem Download prüfen wir, ob alle gesetzlichen Pflichtangaben vorhanden und mathematisch korrekt summiert sind.
                  So wird Ihre ZUGFeRD-Datei von modernen ERP-Systemen problemlos verarbeitet.
                </p>
              </div>
            </div>
          </div>
          <ValidationReport />
        </div>
      </SectionBand>

      {/* FAQ */}
      <SectionBand>
        <FaqSection
          title="Häufig gestellte Fragen zu ZUGFeRD-Rechnungen"
          subtitle="Die wichtigsten Fragen rund um Rechnungsstellung und Konvertierung."
          faqs={faqs}
        />
      </SectionBand>

      {/* Final CTA */}
      <SectionBand tone="dark">
        <section className="text-center max-w-3xl mx-auto">
          <h2 className="type-display">Starten Sie jetzt mit Ihrer ersten E-Rechnung</h2>
          <p className="mt-4 max-w-xl mx-auto text-base sm:text-lg leading-relaxed text-[var(--color-text-secondary)]">
            Keine manuelle Dateneingabe, keine komplexe ERP-Software. Ob PDF in ZUGFeRD-Format oder PDF zu XRechnung – machen Sie Ihr
            Unternehmen heute bereit für die E-Rechnungspflicht.
          </p>
          <div className="mt-8 sm:mt-10">
            <Link href={CONVERTER_HREF} className={ctaClass}>
              <span>Jetzt ZUGFeRD-Datei erstellen</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </SectionBand>
    </div>
  );
}

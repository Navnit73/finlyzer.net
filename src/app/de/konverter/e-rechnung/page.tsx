import type { Metadata } from 'next';
import { CheckCircle2 } from 'lucide-react';
import EinvoiceTool from '@/components/de/einvoice/tool/EinvoiceTool';
import { pageMetadata } from '@/lib/seo-config';

const path = '/de/konverter/e-rechnung';
const title = 'E-Rechnung erstellen, auslesen und prüfen | Finlyzers';
const description =
  'PDF-Rechnungen in ZUGFeRD oder XRechnung umwandeln, Daten aus E-Rechnungen auslesen und gegen EN 16931 prüfen.';

// The tool itself. Indexable (robots from the layout) for the "E-Rechnung erstellen / auslesen / prüfen"
// intent; /de keeps "PDF in ZUGFeRD umwandeln", so keep this title off that phrase.
export const metadata: Metadata = pageMetadata({ title, description, path, locale: 'de' });

const highlights = ['ZUGFeRD PDF/A-3', 'XRechnung XML', 'EN 16931 geprüft', 'Revisionssicher archiviert'];

export default function GermanEinvoiceToolPage() {
  return (
    <EinvoiceTool
      intro={
        <header className="max-w-3xl">
          <span className="feature-badge">EN 16931 (COMFORT) · ZUGFeRD 2.x · XRechnung 3.x</span>
          <h1 className="type-hero !text-[clamp(1.875rem,3.6vw,2.75rem)] mt-4 text-balance">E-Rechnung erstellen, auslesen und prüfen</h1>
          <p className="type-lead !text-[17px] mt-3">
            Wandeln Sie Ihre PDF-Rechnung in eine ZUGFeRD-Datei für Geschäftskunden oder eine XRechnung für Behörden um. Jede Datei wird vor der
            Ausgabe nachgerechnet und nach EN 16931 validiert.
          </p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[var(--color-text-secondary)]">
            {highlights.map((h) => (
              <li key={h} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" aria-hidden="true" /> {h}
              </li>
            ))}
          </ul>
        </header>
      }
    />
  );
}

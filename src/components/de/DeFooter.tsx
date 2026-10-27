import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { GERMAN_ROOT } from '@/lib/i18n';
import { DE_TRUST_PAGES } from '@/lib/trust-pages';

/** Footer of the German section. Links back to the main English homepage for cross-site authority transfer. */
export default function DeFooter() {
  return (
    <footer className="w-full section-parchment hairline-t mt-auto text-[13px] leading-[1.5] text-[var(--color-text-secondary)]">
      <div className="site-container pt-12 sm:pt-16 pb-8 sm:pb-10">
        <div className="flex flex-col md:flex-row md:justify-between gap-10">
          <div className="space-y-5 max-w-md">
            <BrandLogo size="sm" href={GERMAN_ROOT} linkLabel="Finlyzers Startseite" textClassName="!text-[17px]" />
            <p className="text-[14px] leading-relaxed">
              Verständliche Informationen zu Steuern, Finanzen und Buchhaltung für Selbstständige und kleine Unternehmen.
            </p>
            <Link href="/" className="inline-block hover:text-[var(--color-ink)] transition-colors">
              Finlyzers auf Englisch &rarr;
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 sm:gap-14">
            <nav aria-label="Tools und Ratgeber">
              <span className="block font-semibold text-[var(--color-ink)] mb-3 text-[13px]">
                Tools &amp; Ratgeber
              </span>
              <ul className="space-y-2 text-[14px]">
                <li>
                  <Link href="/de/konverter/e-rechnung" className="hover:text-[var(--color-ink)] transition-colors">
                    E-Rechnung Konverter
                  </Link>
                </li>
                <li>
                  <Link href="/de/ratgeber" className="hover:text-[var(--color-ink)] transition-colors">
                    Ratgeber Übersicht
                  </Link>
                </li>
                <li>
                  <Link href="/de/ratgeber/zugferd-rechnung" className="hover:text-[var(--color-ink)] transition-colors">
                    ZUGFeRD-Rechnung Leitfaden
                  </Link>
                </li>
              </ul>
            </nav>

            <nav aria-label="Rechtliches und Kontakt">
              <span className="block font-semibold text-[var(--color-ink)] mb-3 text-[13px]">
                Rechtliches &amp; Kontakt
              </span>
              <ul className="grid grid-cols-2 gap-x-8 gap-y-2 text-[14px]">
                {DE_TRUST_PAGES.map((p) => (
                  <li key={p.path}>
                    <Link href={p.path} className="hover:text-[var(--color-ink)] transition-colors">
                      {p.shortTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 sm:mt-14 pt-6 hairline-t flex flex-col md:flex-row md:items-center justify-between gap-4 text-[12px] text-[var(--color-text-muted)]">
          <p>&copy; {new Date().getFullYear()} Finlyzers (NAVNIT RAI). Alle Rechte vorbehalten.</p>
          <p>Alle Angaben ohne Gewähr. Keine Steuer- oder Rechtsberatung.</p>
        </div>
      </div>
    </footer>
  );
}

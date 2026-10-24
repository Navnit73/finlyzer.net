import BrandLogo from '@/components/BrandLogo';
import { GERMAN_ROOT } from '@/lib/i18n';

/** Footer of the German section. */
export default function DeFooter() {
  return (
    <footer className="w-full section-parchment hairline-t mt-auto text-[13px] leading-[1.5] text-[var(--color-text-secondary)]">
      <div className="site-container pt-12 sm:pt-16 pb-8 sm:pb-10">
        <div className="space-y-5 max-w-md">
          <BrandLogo size="sm" href={GERMAN_ROOT} linkLabel="Finlyzers Startseite" textClassName="!text-[17px]" />
          <p className="text-[14px] leading-relaxed">
            Verständliche Informationen zu Steuern, Finanzen und Buchhaltung für Selbstständige und kleine Unternehmen.
          </p>
        </div>

        <div className="mt-12 sm:mt-14 pt-6 hairline-t flex flex-col md:flex-row md:items-center justify-between gap-4 text-[12px] text-[var(--color-text-muted)]">
          <p>&copy; {new Date().getFullYear()} Finlyzers (NAVNIT RAI). Alle Rechte vorbehalten.</p>
          <p>Alle Angaben ohne Gewähr. Keine Steuer- oder Rechtsberatung.</p>
        </div>
      </div>
    </footer>
  );
}

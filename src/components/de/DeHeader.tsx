import React from 'react';
import Link from 'next/link';
import BrandLogo from '@/components/BrandLogo';
import { GERMAN_ROOT } from '@/lib/i18n';

/**
 * Header of the German section. Rendered only by src/app/de/layout.tsx. /de is a standalone site
 * with its own nav; it links back to the main English homepage for cross-site authority transfer.
 */
export default function DeHeader() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="surface-frosted hairline-b">
        <div className="site-container">
          <nav className="flex items-center justify-between h-[var(--nav-height)]" aria-label="Hauptnavigation">
            <BrandLogo size="sm" href={GERMAN_ROOT} linkLabel="Finlyzers Startseite" textClassName="!text-[19px]" tag="DE" priority />
            <div className="flex items-center gap-5 sm:gap-7 text-[14px] font-medium">
              <Link
                href="/de/konverter/e-rechnung"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors py-2"
              >
                E-Rechnung Konverter
              </Link>
              <Link
                href="/de/ratgeber"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors py-2"
              >
                Ratgeber
              </Link>
              <Link
                href="/"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-ink)] transition-colors py-2"
              >
                English
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

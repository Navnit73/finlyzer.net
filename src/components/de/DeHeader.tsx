import React from 'react';
import BrandLogo from '@/components/BrandLogo';
import { GERMAN_ROOT } from '@/lib/i18n';

/**
 * Header of the German section. Rendered only by src/app/de/layout.tsx. /de is a standalone site:
 * no sign-in, app or English links.
 */
export default function DeHeader() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="surface-frosted hairline-b">
        <div className="site-container">
          <nav className="flex items-center h-[var(--nav-height)]" aria-label="Hauptnavigation">
            <BrandLogo size="sm" href={GERMAN_ROOT} linkLabel="Finlyzers Startseite" textClassName="!text-[19px]" tag="DE" priority />
          </nav>
        </div>
      </div>
    </header>
  );
}

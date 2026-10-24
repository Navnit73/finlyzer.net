import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import { GERMAN_ROOT } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'Seite nicht gefunden',
  robots: { index: false, follow: true },
};

export default function GermanNotFound() {
  return (
    <section className="max-w-2xl mx-auto py-16 sm:py-28 text-center">
      <p className="text-[17px] font-medium text-[var(--color-text-muted)] tabular-nums">404</p>
      <h1 className="type-hero mt-2">Seite nicht gefunden</h1>
      <p className="type-lead mt-5 max-w-xl mx-auto">
        Diese Seite gibt es nicht oder sie ist umgezogen.
      </p>
      <Link href={GERMAN_ROOT} className="link mt-8 inline-flex items-center gap-0.5 min-h-[44px] text-[17px]">
        Zur Startseite
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </section>
  );
}

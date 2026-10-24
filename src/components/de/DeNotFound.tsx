import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { GERMAN_ROOT } from '@/lib/i18n';

const links = [
  { href: GERMAN_ROOT, label: 'Startseite' },
  { href: '/de/faq', label: 'Häufige Fragen' },
  { href: '/de/ueber-uns', label: 'Über uns' },
  { href: '/de/kontakt', label: 'Kontakt' },
];

/** German 404 content. Used by src/app/de/not-found.tsx (notFound() in /de) and src/app/global-not-found.tsx (unmatched /de URLs). */
export default function DeNotFound() {
  return (
    <section className="max-w-2xl mx-auto py-16 sm:py-28 text-center">
      <p className="text-[17px] font-medium text-[var(--color-text-muted)] tabular-nums">404</p>
      <h1 className="type-hero mt-2">Seite nicht gefunden</h1>
      <p className="type-lead mt-5 max-w-xl mx-auto">
        Diese Seite gibt es nicht oder sie ist umgezogen. Vielleicht helfen Ihnen diese Seiten weiter:
      </p>
      <ul className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="link inline-flex items-center gap-0.5 min-h-[44px] text-[17px]">
              {l.label}
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

const links = [
  { href: '/', label: 'Bank statement converter' },
  { href: '/convert', label: 'All converters' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/faq', label: 'FAQ' },
];

export default function NotFound() {
  return (
    <section className="max-w-2xl mx-auto py-16 sm:py-28 text-center">
      <p className="text-[17px] font-medium text-[var(--color-text-muted)] tabular-nums">404</p>
      <h1 className="type-hero mt-2">Page not found</h1>
      <p className="type-lead mt-5 max-w-xl mx-auto">
        The page you were looking for doesn&apos;t exist or has moved. These pages might help:
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

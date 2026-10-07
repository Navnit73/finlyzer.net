import Link from 'next/link';
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
    <section className="max-w-xl mx-auto py-16 sm:py-24 text-center space-y-6">
      <p className="feature-badge">404</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-ink)]">Page not found</h1>
      <p className="text-base sm:text-lg text-[var(--color-text-secondary)]">
        The page you were looking for doesn&apos;t exist or has moved. These pages might help:
      </p>
      <ul className="flex flex-wrap justify-center gap-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="btn-brand-secondary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

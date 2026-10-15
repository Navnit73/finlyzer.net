import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  /** Omit for the current page. */
  href?: string;
}

/**
 * Slim dark ribbon directly under the site header. It cancels the page <main>
 * top padding so it sits flush against the nav, and bleeds edge-to-edge like
 * the SectionBand tones without causing horizontal scroll.
 */
export default function BreadcrumbStrip({ items }: { items: Crumb[] }) {
  return (
    <div className="surface-dark -mt-6 sm:-mt-10 shadow-[0_0_0_100vmax_var(--color-surface)] [clip-path:inset(0_-100vmax)]">
      <nav aria-label="Breadcrumbs" className="min-h-[36px] flex items-center">
        <ol className="flex items-center gap-1.5 min-w-0 text-[12px] text-[var(--color-text-muted)]">
          {items.map((item, i) => {
            const isLast = i === items.length - 1;
            return (
              <li key={item.label} className={`flex items-center gap-1.5 ${isLast ? 'min-w-0' : 'shrink-0'}`}>
                {i > 0 && <ChevronRight className="w-3 h-3 shrink-0" aria-hidden="true" />}
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="inline-flex items-center min-h-[36px] hover:text-[var(--color-ink)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="truncate text-[var(--color-ink)]" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

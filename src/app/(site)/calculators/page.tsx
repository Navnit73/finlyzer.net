import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import BreadcrumbStrip from '@/components/layout/BreadcrumbStrip';
import { CALCULATOR_SLUGS } from '@/components/calculators/registry';
import { SectionBand } from '@/components/converter/sections';
import { getAllCalculatorPages } from '@/lib/seo-markdown';
import { absoluteUrl, getBreadcrumbJsonLd, getWebPageJsonLd, pageMetadata, serializeJsonLd } from '@/lib/seo-config';
import type { SEOCalculatorPage } from '@/types/seo';

const TITLE = 'Finance Calculators';
const DESCRIPTION =
  'Free loan, savings, investment and business calculators with the formula, a worked example and a full breakdown for each result. Runs in your browser.';

export const metadata: Metadata = pageMetadata({
  title: `${TITLE}: Loans, Savings, Investing & Business | Finlyzers`,
  description: DESCRIPTION,
  path: '/calculators',
});

/** Hub order; groups not listed here sort after these, alphabetically. */
const GROUP_ORDER = [
  'Loans and credit',
  'Savings and planning',
  'Investing',
  'Salary and tax',
  'Profitability and cash',
  'Business planning',
];

const SECTIONS: { category: SEOCalculatorPage['category']; title: string; body: string }[] = [
  { category: 'personal', title: 'Personal finance', body: 'Loans, savings, investing and take-home pay.' },
  { category: 'business', title: 'Business finance', body: 'Margins, cash flow and planning for small businesses.' },
];

/** Upload-based tools that sit next to the business calculators. */
const STATEMENT_TOOLS = [
  { href: '/reconcile/bank-reconciliation-tool', label: 'Bank reconciliation tool', body: 'Match a bank statement against your ledger.' },
  { href: '/analyzer/bank-statement-analyzer', label: 'Bank statement analyzer', body: 'Money in, money out and recurring charges.' },
  { href: '/convert/bank-statement-to-csv', label: 'Bank statement to CSV', body: 'Turn a PDF statement into a CSV file.' },
];

function groupRank(group: string): number {
  const i = GROUP_ORDER.indexOf(group);
  return i === -1 ? GROUP_ORDER.length : i;
}

export default function CalculatorsHubPage() {
  const pages = getAllCalculatorPages().filter((p) => CALCULATOR_SLUGS.has(p.slug));

  const jsonLd = serializeJsonLd([
    {
      ...getWebPageJsonLd({ path: '/calculators', name: TITLE, description: DESCRIPTION }),
      '@type': 'CollectionPage',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: pages.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: absoluteUrl(`/calculators/${p.slug}`), name: p.shortTitle })),
      },
    },
    getBreadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Calculators', path: '/calculators' },
    ]),
  ]);

  return (
    <div className="w-full -mb-6 sm:-mb-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <BreadcrumbStrip items={[{ label: 'Home', href: '/' }, { label: 'Calculators' }]} />

      <section
        aria-labelledby="hub-title"
        className="w-full pb-10 sm:pb-14 bg-[var(--color-surface-subtle)] shadow-[0_0_0_100vmax_var(--color-surface-subtle)] [clip-path:inset(0_-100vmax)]"
      >
        <div className="pt-6 sm:pt-12 text-center max-w-3xl mx-auto">
          <h1 id="hub-title" className="type-hero !text-[clamp(2rem,6vw,3.25rem)] text-balance">
            {TITLE}
          </h1>
          <p className="mt-5 type-lead">
            Each calculator shows the formula it uses, a worked example and a breakdown you can check by hand. Everything runs in your browser: nothing you type is
            uploaded or stored.
          </p>
        </div>
      </section>

      {SECTIONS.map((section, si) => {
        const inSection = pages.filter((p) => p.category === section.category);
        if (inSection.length === 0) return null;
        const groups = [...new Set(inSection.map((p) => p.group))].sort((a, b) => groupRank(a) - groupRank(b) || a.localeCompare(b));
        return (
          <SectionBand key={section.category} tone={si % 2 === 0 ? 'white' : 'parchment'}>
            <section aria-labelledby={`${section.category}-title`} className="space-y-10">
              <div>
                <h2 id={`${section.category}-title`} className="type-display">
                  {section.title}
                </h2>
                <p className="mt-2 type-lead">{section.body}</p>
              </div>
              {groups.map((group) => (
                <div key={group} className="space-y-4">
                  <h3 className="type-headline">{group}</h3>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {inSection
                      .filter((p) => p.group === group)
                      .map((p) => (
                        <li key={p.slug}>
                          <ToolCard href={`/calculators/${p.slug}`} label={p.shortTitle} body={p.summary} market={p.market} />
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
              {section.category === 'business' && (
                <div className="space-y-4">
                  <h3 className="type-headline">Bank statement tools</h3>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {STATEMENT_TOOLS.map((t) => (
                      <li key={t.href}>
                        <ToolCard {...t} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </SectionBand>
        );
      })}
    </div>
  );
}

function ToolCard({ href, label, body, market }: { href: string; label: string; body: string; market?: string }) {
  return (
    <Link href={href} className="card-surface group flex h-full items-center justify-between gap-3 p-5">
      <span className="space-y-1">
        <span className="block text-[17px] font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-brand-dark)]">{label}</span>
        <span className="block type-caption !text-[14px]">{body}</span>
        {market && market !== 'Global' && <span className="block text-[12px] text-[var(--color-text-muted)]">{market}</span>}
      </span>
      <ArrowRight className="w-4 h-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden="true" />
    </Link>
  );
}

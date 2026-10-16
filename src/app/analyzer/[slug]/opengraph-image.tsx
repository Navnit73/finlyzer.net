import { ImageResponse } from 'next/og';
import { getAnalyzerPageBySlug } from '@/lib/seo-markdown';
import { ANALYZERS } from '@/lib/analyzers';

// Per-page share image for /analyzer/[slug] (overrides the root opengraph-image.png).
// Satori can't read CSS variables, so these mirror the tokens in src/app/globals.css.
const TOKENS = {
  ink: '#1d1d1f', // --color-ink
  textSecondary: '#6e6e73', // --color-text-muted
  surfaceSubtle: '#f5f5f7', // --color-surface-subtle
  border: '#e0e0e5', // --color-border
  brand: '#0071e3', // --color-brand
  brandSoft: '#e8f2fd', // --color-brand-soft
  brandDark: '#0066cc', // --color-brand-dark
  surface: '#ffffff', // --color-surface
};

export const alt = 'Finlyzers bank statement analyzer';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return ANALYZERS.map((a) => ({ slug: a.slug }));
}

const FORMATS = ['Categories', 'Daily spend', 'Subscriptions', 'Savings'];

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getAnalyzerPageBySlug(slug);
  const title = page?.title ?? 'Bank Statement Analyzer';
  const badge = page?.badgeText ?? 'Spending analysis';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: TOKENS.surface,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: TOKENS.brand }} />
          <div style={{ fontSize: 36, fontWeight: 600, color: TOKENS.ink }}>Finlyzers</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              padding: '10px 22px',
              borderRadius: 999,
              background: TOKENS.brandSoft,
              color: TOKENS.brandDark,
              fontSize: 26,
              fontWeight: 500,
            }}
          >
            {badge}
          </div>
          <div style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.05, color: TOKENS.ink, letterSpacing: -2.5 }}>
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {FORMATS.map((fmt) => (
            <div
              key={fmt}
              style={{
                display: 'flex',
                padding: '8px 20px',
                borderRadius: 999,
                border: `2px solid ${TOKENS.border}`,
                background: TOKENS.surfaceSubtle,
                color: TOKENS.ink,
                fontSize: 24,
                fontWeight: 500,
              }}
            >
              {fmt}
            </div>
          ))}
          <div style={{ display: 'flex', marginLeft: 'auto', fontSize: 24, color: TOKENS.textSecondary }}>
            finlyzers.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}

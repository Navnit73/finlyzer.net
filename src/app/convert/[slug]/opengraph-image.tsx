import { ImageResponse } from 'next/og';
import { getAllLandingPages, getLandingPageBySlug } from '@/lib/seo-markdown';

// Per-converter share image (overrides the root opengraph-image.png for /convert/[slug]).
// Satori can't read CSS variables, so these mirror the tokens in src/app/globals.css.
const TOKENS = {
  ink: '#171717', // --color-ink
  textSecondary: '#777777', // --color-text-secondary
  surfaceSubtle: '#f5f5f5', // --color-surface-subtle
  border: '#e5e5e5', // --color-border
  brand: '#70f000', // --color-brand
  brandSoft: '#e9ffd6', // --color-brand-soft
  onBrand: '#141414', // --color-on-brand
  surface: '#ffffff', // --color-surface
};

export const alt = 'Finlyzers bank statement converter';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return getAllLandingPages().map((page) => ({ slug: page.slug }));
}

const FORMATS = ['Excel', 'CSV', 'QBO', 'OFX', 'QIF'];

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getLandingPageBySlug(slug);
  const title = page?.title ?? 'Bank Statement Converter';
  const badge = page?.badgeText ?? 'Bank statements';

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
          background: TOKENS.surfaceSubtle,
          borderBottom: `16px solid ${TOKENS.brand}`,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 20, height: 20, borderRadius: 999, background: TOKENS.brand }} />
          <div style={{ fontSize: 36, fontWeight: 800, color: TOKENS.ink }}>Finlyzers</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              padding: '10px 22px',
              borderRadius: 999,
              background: TOKENS.brandSoft,
              color: TOKENS.onBrand,
              fontSize: 26,
              fontWeight: 700,
            }}
          >
            {badge}
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, color: TOKENS.ink, letterSpacing: -2 }}>
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
                background: TOKENS.surface,
                color: TOKENS.ink,
                fontSize: 24,
                fontWeight: 700,
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

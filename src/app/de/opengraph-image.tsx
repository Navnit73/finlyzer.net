import { ImageResponse } from 'next/og';

// German share card for /de (the root opengraph-image.jpg shows the English converter).
// pageMetadata({ locale: 'de' }) points every German page at this image.
// Satori can't read CSS variables, so these mirror the tokens in src/app/globals.css.
const TOKENS = {
  ink: '#1d1d1f', // --color-ink
  textSecondary: '#6e6e73', // --color-text-muted
  surface: '#ffffff', // --color-surface
  brand: '#0071e3', // --color-brand
  brandSoft: '#e8f2fd', // --color-brand-soft
  brandDark: '#0066cc', // --color-brand-dark
};

export const alt = 'Finlyzers: PDF-Rechnungen in ZUGFeRD und XRechnung umwandeln';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
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
            E-Rechnung nach EN 16931
          </div>
          <div style={{ fontSize: 72, fontWeight: 600, lineHeight: 1.05, color: TOKENS.ink, letterSpacing: -2.5 }}>
            PDF in ZUGFeRD &amp; XRechnung umwandeln
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 24, color: TOKENS.textSecondary }}>finlyzers.com/de</div>
      </div>
    ),
    size,
  );
}

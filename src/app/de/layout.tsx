import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import DeHeader from '@/components/de/DeHeader';
import DeFooter from '@/components/de/DeFooter';
import { GERMAN_ROOT } from '@/lib/i18n';
import { SITE_NAME, SITE_URL } from '@/lib/seo-config';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// Root layout of the German section, separate from the English one in src/app/(site)/layout.tsx so
// the server-rendered <html> carries lang="de". Every page overrides title, description,
// canonical and hreflang via pageMetadata({ locale: 'de' }).
// No analytics script here: there is no consent banner yet, which German visitors require.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Finlyzers auf Deutsch',
    template: '%s | Finlyzers',
  },
  description:
    'Finlyzers auf Deutsch: Finanzen, Steuern und Buchhaltung für Selbstständige und kleine Unternehmen.',
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: `${SITE_URL}${GERMAN_ROOT}` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Same Google Search Console HTML-tag verification as the English layout.
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
  formatDetection: { email: false, address: false, telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: { type: 'website', locale: 'de_DE', siteName: SITE_NAME },
  twitter: { card: 'summary_large_image' },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function GermanLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" data-theme="light" className={inter.variable}>
      <body suppressHydrationWarning className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] font-sans antialiased">
        <div className="min-h-screen flex flex-col">
          <a href="#inhalt" className="skip-link">
            Zum Inhalt springen
          </a>
          <DeHeader />
          <main id="inhalt" tabIndex={-1} className="flex-1 w-full site-container py-6 sm:py-10">
            {children}
          </main>
          <DeFooter />
        </div>
      </body>
    </html>
  );
}

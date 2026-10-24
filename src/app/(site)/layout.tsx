import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { SITE_NAME, SITE_URL } from "@/lib/seo-config";

// SF Pro is used natively on Apple platforms via the system stack in globals.css;
// Inter is the closest open equivalent everywhere else.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Site-wide defaults. Every indexable page overrides title, description, canonical and social
// tags via pageMetadata() in src/lib/seo-config.ts; share images come from opengraph-image.jpg.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bank Statement Converter: PDF to Excel, CSV & QBO | Finlyzers",
    template: "%s | Finlyzers",
  },
  description:
    "Convert PDF and scanned bank statements to Excel, CSV, QBO, OFX or QIF. Transactions are extracted with OCR and checked against the statement balance.",
  applicationName: SITE_NAME,
  authors: [{ name: "Finlyzers", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  // Google Search Console HTML-tag verification. Set GOOGLE_SITE_VERIFICATION (the tag's content value) at build time.
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {}),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

import { AuthProvider } from "@/components/auth/AuthProvider";
import AppShell from "@/components/layout/AppShell";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" className={inter.variable}>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] font-sans antialiased"
      >
        {/* Microsoft Clarity analytics */}
        <Script
          id="microsoft-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "yszul1h1c2");
            `,
          }}
        />
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}




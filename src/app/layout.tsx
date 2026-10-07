import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { SITE_NAME, SITE_URL } from "@/lib/seo-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Site-wide defaults. Every indexable page overrides title, description, canonical and social
// tags via pageMetadata() in src/lib/seo-config.ts; share images come from opengraph-image.png.
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
    <html lang="en" data-theme="light" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[var(--color-surface)] text-[var(--color-ink)] font-sans antialiased selection:bg-[var(--color-brand)] selection:text-[var(--color-on-brand)]">
        {/* Microsoft Clarity analytics. next/head is ignored in the App Router, so load it with next/script after hydration. */}
        <Script id="ms-clarity" src="https://www.clarity.ms/tag/yszul1h2c2" strategy="afterInteractive" />
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}



